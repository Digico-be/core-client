import { useCallback, useEffect, useRef, useState } from 'react'

import { createFileMessage } from '../services/file_message'
import { ThreadService } from '../services/OpenAi/threadService'
import { destroyThread } from '../services/thread'

import { IAFile } from '../models/file'
import { Message } from '../models/message'
import { Thread, ThreadMessageContent } from '../models/thread'
import { SessionStorage } from '../utils/sessions'

import { useAssistantRun } from './useAssistantRun'
import { useStreamAssistantResponse } from './useStreamAssistantResponse'
import { useThreadMessages } from './useThreadMessages'

export const useChatThread = (
    tabId: string,
    assistantId: string,
    module: string,
    workspaceSlug: string,
    initialThreadId?: string
) => {
    const [thread, setThread] = useState<Thread | null>(null)
    const { messages, setMessages, deleteMessage, editMessage: baseEditMessage } = useThreadMessages()
    const { streamedResponse, stream } = useStreamAssistantResponse(workspaceSlug)
    const lastSeqRef = useRef(0)

    /* --- chargement initial --- */
    useEffect(() => {
        if (!initialThreadId) return

        const seq = ++lastSeqRef.current
        const id = initialThreadId

        setThread({ id, assistantId, module, createdAt: new Date().toISOString() })
        setMessages([])
        SessionStorage.setThreadIdForTab(tabId, id)

        ;(async () => {
            try {
                const raw = await ThreadService.getMessagesFromThread(id)
                raw.sort((a: any, b: any) => a.created_at - b.created_at)
                if (lastSeqRef.current !== seq) return

                const parsed = raw.map(
                    (m: any): Message => ({
                        id: m.id,
                        sender: m.role === 'user' ? 'user' : 'assistant',
                        content: m.content[0]?.text?.value ?? '',
                        timestamp: new Date(m.created_at * 1000).toISOString(),
                        threadId: id
                    })
                )
                setMessages(parsed)
            } catch {}
        })()
    }, [initialThreadId, assistantId, module, tabId, setMessages])

    useEffect(() => {
        if (thread && !initialThreadId) {
            setThread(null)
            setMessages([])
        }
    }, [initialThreadId, thread, setMessages])

    const addThinking = useCallback(
        (threadId: string) =>
            setMessages(prev => [
                ...prev,
                {
                    id: 'thinking',
                    sender: 'assistant',
                    content: '🤖 L’assistant réfléchit...',
                    timestamp: new Date().toISOString(),
                    threadId
                }
            ]),
        [setMessages]
    )

    const removeThinking = useCallback(
        () => setMessages(prev => prev.filter(m => m.id !== 'thinking')),
        [setMessages]
    )

    const pushAssistantMessage = useCallback(
        (msg: Message) => setMessages(prev => [...prev, msg]),
        [setMessages]
    )

    const { runWithFiles } = useAssistantRun(
        assistantId,
        () => addThinking(thread!.id),
        removeThinking,
        pushAssistantMessage
    )

    const removeThread = useCallback(
        async (threadId: string) => {
            try {
                await ThreadService.deleteThread(threadId)
                await destroyThread(threadId)
            } catch {}
            SessionStorage.removeThreadIdForTab(tabId)
            setThread(null)
        },
        [tabId]
    )

    const sendMessage = useCallback(
        async (
            input: string | ThreadMessageContent[],
            attachments?: IAFile[],
            options: { skipUserMessage?: boolean } = {}
        ) => {
            if (!thread?.id) return

            const content: ThreadMessageContent[] =
                typeof input === 'string' ? [{ type: 'text', text: input }] : input

            const promptText =
                content.find((c): c is { type: 'text'; text: string } => c.type === 'text')?.text || ''

            const hasFile = !!attachments?.length
            const attachmentIds = attachments?.map(f => f.id) || []

            const userRes = await ThreadService.sendMessageToThread(thread.id, content, 'user', attachmentIds)

            if (!options.skipUserMessage) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: userRes.id,
                        sender: 'user',
                        content: promptText,
                        timestamp: new Date(userRes.created_at * 1000).toISOString(),
                        threadId: thread.id,
                        attachments: attachments?.map(f => ({
                            openai_id: f.id,
                            filename: f.filename,
                            size: f.size ?? 0,
                            mime_type: f.mimeType ?? 'application/octet-stream'
                        }))
                    }
                ])
            }

            if (hasFile) {
                for (const f of attachments!) {
                    await createFileMessage({
                        file_openai_id: f.id,
                        message_openai_id: userRes.id,
                        thread_openai_id: thread.id
                    })
                }
            }

            if (hasFile) {
                await runWithFiles(thread.id)
            } else {
                addThinking(thread.id)
                const full = await stream(promptText, removeThinking)
                if (full.trim()) {
                    const aRes = await ThreadService.sendMessageToThread(
                        thread.id,
                        [{ type: 'text', text: full }],
                        'assistant'
                    )
                    pushAssistantMessage({
                        id: aRes.id,
                        sender: 'assistant',
                        content: full,
                        timestamp: new Date(aRes.created_at * 1000).toISOString(),
                        threadId: thread.id
                    })
                }
            }
        },
        [
            thread,
            stream,
            runWithFiles,
            setMessages,
            addThinking,
            removeThinking,
            pushAssistantMessage
        ]
    )

// useChatThread.tsx
    const editMessage = useCallback(
        async (threadId: string, messageId: string, newContent: string) => {
            /* 1️⃣ Supprimer TOUTES les réponses assistant qui suivent
                  le message édité dans ce thread */
            setMessages(prev => {
                const index = prev.findIndex(m => m.id === messageId)
                if (index === -1) return prev

                return prev.filter(
                    (m, i) =>
                        !(
                            i > index &&             // après le message édité
                            m.sender === 'assistant' && // réponse assistant
                            m.threadId === prev[index].threadId // même thread
                        )
                )
            })

            /* 2️⃣ Mettre à jour le message utilisateur (peut changer son ID) */
            await baseEditMessage(threadId, messageId, newContent)

            /* 3️⃣ Relancer l’assistant */
            addThinking(threadId)
            const full = await stream(newContent, removeThinking)
            if (!thread?.id || !full.trim()) return

            const aRes = await ThreadService.sendMessageToThread(
                thread.id,
                [{ type: 'text', text: full }],
                'assistant'
            )
            pushAssistantMessage({
                id: aRes.id,
                sender: 'assistant',
                content: full,
                timestamp: new Date(aRes.created_at * 1000).toISOString(),
                threadId: thread.id
            })
        },
        [
            thread,
            stream,
            baseEditMessage,
            addThinking,
            removeThinking,
            pushAssistantMessage,
            setMessages
        ]
    )

    return {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        removeThread,
        thread
    }
}
