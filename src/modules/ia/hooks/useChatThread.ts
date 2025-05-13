import { useCallback, useEffect, useRef, useState } from 'react'

import { createFileMessage } from '../services/file_message'
import { ThreadService } from '../services/OpenAi/threadService'
import { destroyThread } from '../services/thread'

import { Assistant } from '../models/assistant'
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
    initialThreadId?: string,
    assistant?: Assistant,
) => {
    const [thread, setThread] = useState<Thread | null>(null)
    const { messages, setMessages, deleteMessage, editMessage: baseEditMessage } = useThreadMessages()
    const { streamedResponse, stream } = useStreamAssistantResponse(workspaceSlug, module)
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

            const rawText = content.find((c): c is { type: 'text'; text: string } => c.type === 'text')?.text || ''

            // 🧩 Construire le message enrichi pour OpenAI
            const rulesFormatted = Array.isArray(assistant?.rules)
                ? assistant.rules
                : typeof assistant?.rules === 'string'
                    ? [assistant.rules]
                    : []

            const metadataFormatted = assistant?.metadata
                ? Object.entries(assistant.metadata).map(([k, v]) => `- ${k}: ${v}`).join('\n')
                : ''

            const enrichedText = [
                assistant?.persona ? `👤 Persona : ${assistant.persona}` : '',
                assistant?.instructions ? `🧠 Instructions : ${assistant.instructions}` : '',
                rulesFormatted.length ? `📜 Règles :\n- ${rulesFormatted.join('\n- ')}` : '',
                metadataFormatted ? `📌 Métadonnées :\n${metadataFormatted}` : '',
                '',
                rawText
            ].filter(Boolean).join('\n\n')

            console.log('🧾 Message enrichi envoyé à OpenAI :\n', enrichedText)

            const hasFile = !!attachments?.length
            const attachmentIds = attachments?.map(f => f.id) || []

            const userRes = await ThreadService.sendMessageToThread(
                thread.id,
                [{ type: 'text', text: enrichedText }],
                'user',
                attachmentIds
            )

            if (!options.skipUserMessage) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: userRes.id,
                        sender: 'user',
                        content: rawText, // ✅ n'affiche que le message original
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
                await runWithFiles(thread.id)
            } else {
                addThinking(thread.id)
                const full = await stream(enrichedText, removeThinking)
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
            pushAssistantMessage,
            assistant
        ]
    )

    const editMessage = useCallback(
        async (threadId: string, messageId: string, newContent: string) => {
            console.log('🛠️ Début editMessage')

            const prevMessage = messages.find(m => m.id === messageId)
            if (!prevMessage || !prevMessage.timestamp) {
                console.warn('⚠️ Ancien message non trouvé ou sans timestamp:', messageId)
                return
            }

            await baseEditMessage(threadId, messageId, newContent)

            setMessages(prev => {
                const toRemove = prev.filter(m => {
                    const isAssistant = m.sender === 'assistant'
                    const sameThread = m.threadId === prevMessage.threadId
                    const afterEdit = m.timestamp && new Date(m.timestamp) > new Date(prevMessage.timestamp!)
                    return isAssistant && sameThread && afterEdit
                })

                console.log('🧹 Messages assistant supprimés:', toRemove.map(m => m.id))

                return prev.filter(m => !toRemove.includes(m))
            })

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
        [thread, stream, baseEditMessage, addThinking, removeThinking, pushAssistantMessage, setMessages]
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
