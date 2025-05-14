import { useCallback, useEffect, useRef, useState } from 'react'

import { readAssistant as getAssistantFromLaravel } from '../services/assistant'
import { readMessages } from '../services/message'
import { createMessage as saveMessage } from '../services/message/create-message'
import { ThreadService } from '../services/OpenAi/threadService'
import { destroyThread } from '../services/thread'

import { Assistant } from '../models/assistant'
import { IAFile } from '../models/file'
import { Message } from '../models/message'
import { Thread, ThreadMessageContent } from '../models/thread'
import { buildContextualPrompt } from '../utils/assistantPromptUtils'
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
    const { messages, setMessages, deleteMessage, editMessage: baseEditMessage } =
        useThreadMessages()
    const { streamedResponse, stream } = useStreamAssistantResponse(
        workspaceSlug,
        module,
    )
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
                const list = await readMessages(id)
                if (lastSeqRef.current !== seq) return

                const parsed = list.map(
                    (m: any): Message => ({
                        id: m.openai_id,
                        sender: m.role === 'user' ? 'user' : 'assistant',
                        content: m.raw_text ?? '',
                        timestamp: m.created_at,
                        threadId: id,
                        attachments: m.attachments ?? [],
                    }),
                )
                setMessages(parsed)
            } catch (err) {
                console.error('Erreur chargement messages:', err)
            }
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
                    threadId,
                },
            ]),
        [setMessages],
    )

    const removeThinking = useCallback(
        () => setMessages(prev => prev.filter(m => m.id !== 'thinking')),
        [setMessages],
    )

    const pushAssistantMessage = useCallback(
        (msg: Message) => setMessages(prev => [...prev, msg]),
        [setMessages],
    )

    const pushAndSaveAssistant = useCallback(
        async (msg: Message) => {
            pushAssistantMessage(msg)
            await saveMessage({
                openai_id: msg.id,
                thread_openai_id: thread!.id,
                role: 'assistant',
                raw_text: msg.content,
            })
        },
        [pushAssistantMessage, thread],
    )

    const { runWithFiles } = useAssistantRun(
        assistantId,
        () => addThinking(thread!.id),
        removeThinking,
        pushAndSaveAssistant,
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
        [tabId],
    )

    const sendMessage = useCallback(
        async (
            input: string | ThreadMessageContent[],
            attachments?: IAFile[],
            options: { skipUserMessage?: boolean } = {},
        ) => {
            if (!thread?.id) return

            const content: ThreadMessageContent[] =
                typeof input === 'string' ? [{ type: 'text', text: input }] : input

            const rawText =
                content.find((c): c is { type: 'text'; text: string } => c.type === 'text')?.text || ''

            const updatedAssistant = await getAssistantFromLaravel(assistantId)
            console.log('✅ Assistant récupéré depuis Laravel:', updatedAssistant)

            const enrichedText = buildContextualPrompt(updatedAssistant, rawText)


            const hasFile = !!attachments?.length
            const attachmentIds = attachments?.map(f => f.id) || []

            const userRes = await ThreadService.sendMessageToThread(
                thread.id,
                [{ type: 'text', text: enrichedText }],
                'user',
                attachmentIds,
            )

            await saveMessage({
                openai_id: userRes.id,
                thread_openai_id: thread.id,
                role: 'user',
                raw_text: rawText,
                attachments: attachments?.map(f => ({
                    file_openai_id: f.id,
                    filename: f.filename,
                    size: f.size ?? 0,
                    mime_type: f.mimeType ?? 'application/octet-stream',
                })),
            })

            if (!options.skipUserMessage) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: userRes.id,
                        sender: 'user',
                        content: rawText,
                        timestamp: new Date(userRes.created_at * 1000).toISOString(),
                        threadId: thread.id,
                        attachments: attachments?.map(f => ({
                            openai_id: f.id,
                            filename: f.filename,
                            size: f.size ?? 0,
                            mime_type: f.mimeType ?? 'application/octet-stream',
                        })),
                    },
                ])
            }

            if (hasFile) {
                await runWithFiles(thread.id)
            } else {
                addThinking(thread.id)
                const { content: full, link } = await stream(enrichedText, removeThinking, updatedAssistant)
                if (full.trim()) {
                    const aRes = await ThreadService.sendMessageToThread(
                        thread.id,
                        [{ type: 'text', text: full }],
                        'assistant',
                    )

                    await saveMessage({
                        openai_id: aRes.id,
                        thread_openai_id: thread.id,
                        role: 'assistant',
                        raw_text: link ? `${full}\n\n🔗 [Voir sur la plateforme](${link})` : full,
                    })

                    pushAssistantMessage({
                        id: aRes.id,
                        sender: 'assistant',
                        content: full,
                        timestamp: new Date(aRes.created_at * 1000).toISOString(),
                        threadId: thread.id,
                        ...(link ? { link } : {}),
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
            pushAndSaveAssistant,
            assistant,
        ],
    )

    const editMessage = useCallback(
        async (threadId: string, messageId: string, newContent: string) => {
            const prevMessage = messages.find(m => m.id === messageId)
            if (!prevMessage?.timestamp) return

            await baseEditMessage(threadId, messageId, newContent)

            setMessages(prev =>
                prev.filter(
                    m =>
                        !(
                            m.sender === 'assistant' &&
                            m.threadId === prevMessage.threadId &&
                            m.timestamp &&
                            new Date(m.timestamp) > new Date(prevMessage.timestamp!)
                        ),
                ),
            )

            addThinking(threadId)
            const enrichedText = buildContextualPrompt(assistant, newContent)
            const { content: full } = await stream(enrichedText, removeThinking)
            if (!thread?.id || !full.trim()) return

            const aRes = await ThreadService.sendMessageToThread(
                thread.id,
                [{ type: 'text', text: full }],
                'assistant',
            )

            await saveMessage({
                openai_id: aRes.id,
                thread_openai_id: thread.id,
                role: 'assistant',
                raw_text: full,
            })

            pushAssistantMessage({
                id: aRes.id,
                sender: 'assistant',
                content: full,
                timestamp: new Date(aRes.created_at * 1000).toISOString(),
                threadId: thread.id,
            })
        },
        [
            thread,
            stream,
            baseEditMessage,
            addThinking,
            removeThinking,
            pushAssistantMessage,
            setMessages,
            messages,
            assistant,
        ],
    )

    return {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        removeThread,
        thread,
    }
}