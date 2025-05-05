import { useCallback,useEffect, useRef, useState } from 'react'

import { createFileMessage } from '../services/file_message'
import { RunService } from '../services/OpenAi/runService'
import { ThreadService } from '../services/OpenAi/threadService'
import { destroyThread } from '../services/thread'

import { IAFile } from '../models/file'
import { Message } from '../models/message'
import { Thread, ThreadMessageContent } from '../models/thread'
import { SessionStorage } from '../utils/sessions'

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

                const parsed: Message[] = raw.map((m: any) => ({
                    id: m.id,
                    sender: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content[0]?.text?.value ?? '',
                    timestamp: new Date(m.created_at * 1000).toISOString(),
                    threadId: id
                }))

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

    const addThinking = useCallback((threadId: string) => {
        setMessages(prev => [
            ...prev,
            {
                id: 'thinking',
                sender: 'assistant',
                content: '🤖 L’assistant réfléchit...',
                timestamp: new Date().toISOString(),
                threadId
            }
        ])
    }, [setMessages])

    const removeThinking = useCallback(() => {
        setMessages(prev => prev.filter(m => m.id !== 'thinking'))
    }, [setMessages])

    const removeThread = useCallback(async (threadId: string) => {
        try {
            await ThreadService.deleteThread(threadId)
            await destroyThread(threadId)
        } catch {}
        SessionStorage.removeThreadIdForTab(tabId)
        setThread(null)
    }, [tabId])

    const sendMessage = useCallback(
        async (
            input: string | ThreadMessageContent[],
            attachments?: IAFile[],
            options: { skipUserMessage?: boolean } = {}
        ) => {
            if (!thread?.id) return

            const content: ThreadMessageContent[] =
                typeof input === 'string' ? [{ type: 'text', text: input }] : input

            const promptText = content.find(
                (c): c is { type: 'text'; text: string } => c.type === 'text'
            )?.text || ''

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

            addThinking(thread.id)

            if (hasFile) {
                try {
                    const run = await RunService.startRun(thread.id, assistantId)
                    const poll = setInterval(async () => {
                        const status = await RunService.getStatus(thread.id, run.id)
                        if (status.status === 'completed' || status.status === 'failed') {
                            clearInterval(poll)
                            removeThinking()

                            if (status.status === 'completed') {
                                const all = await ThreadService.getMessagesFromThread(thread.id)
                                const msg = all.find(m => m.role === 'assistant')
                                if (msg) {
                                    setMessages(prev => [
                                        ...prev,
                                        {
                                            id: msg.id,
                                            sender: 'assistant',
                                            content: msg.content[0]?.text?.value || '',
                                            timestamp: new Date(msg.created_at * 1000).toISOString(),
                                            threadId: thread.id
                                        }
                                    ])
                                }
                            } else {
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        id: crypto.randomUUID(),
                                        sender: 'assistant',
                                        content: '❌ Erreur lors du traitement du fichier.',
                                        timestamp: new Date().toISOString(),
                                        threadId: thread.id
                                    }
                                ])
                            }
                        }
                    }, 2000)
                } catch {
                    removeThinking()
                }
            } else {
                const full = await stream(promptText, () => removeThinking())
                if (full.trim()) {
                    const aRes = await ThreadService.sendMessageToThread(
                        thread.id,
                        [{ type: 'text', text: full }],
                        'assistant'
                    )
                    setMessages(prev => [
                        ...prev,
                        {
                            id: aRes.id,
                            sender: 'assistant',
                            content: full,
                            timestamp: new Date(aRes.created_at * 1000).toISOString(),
                            threadId: thread.id
                        }
                    ])
                }
            }
        },
        [thread, assistantId, stream, setMessages, addThinking, removeThinking]
    )

    const editMessage = useCallback(
        async (threadId: string, messageId: string, newContent: string) => {
            await baseEditMessage(threadId, messageId, newContent)
            addThinking(threadId)

            const full = await stream(newContent, () => removeThinking())

            if (!thread?.id || !full.trim()) return

            const aRes = await ThreadService.sendMessageToThread(thread.id, [{ type: 'text', text: full }], 'assistant')

            setMessages(prev => [
                ...prev,
                {
                    id: aRes.id,
                    sender: 'assistant',
                    content: full,
                    timestamp: new Date(aRes.created_at * 1000).toISOString(),
                    threadId: thread.id
                }
            ])
        },
        [thread, stream, baseEditMessage, setMessages, addThinking, removeThinking]
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
