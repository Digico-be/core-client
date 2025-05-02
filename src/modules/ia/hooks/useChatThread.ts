import { useEffect, useState } from 'react'

import { createFileMessage } from '../services/file_message'
import { RunService } from '../services/OpenAi/runService'
import { StreamService } from '../services/OpenAi/streamService'
import { ThreadService } from '../services/OpenAi/threadService'
import { createThread, findThread, readThread } from '../services/thread'

import { IAFile } from '../models/file'
import { Message } from '../models/message'
import { Thread, ThreadMessageContent } from '../models/thread'
import { SessionStorage } from '../utils/sessions'

import { useThreadMessages } from './useThreadMessages'

type LaravelThread = {
    openai_id: string
    assistant_openai_id: string
    module?: string
    created_at: string
}

export const useChatThread = (tabId: string, assistantId: string, module: string, workspaceSlug: string, initialThreadId?: string) => {
    const [thread, setThread] = useState<Thread | null>(null)
    const [streamedResponse, setStreamedResponse] = useState<string>('')

    const { messages, setMessages, loadMessages, deleteMessage, editMessage } = useThreadMessages()

    const initThread = async () => {
        console.group(`[Tab ${tabId}] initThread`)

        /* 1. si le thread est déjà chargé, on sort */
        if (thread) {
            console.log('⏭ Thread déjà présent, on sort.')
            console.groupEnd()
            return
        }

        /* 2. on attend l’assistantId */
        if (!assistantId) {
            console.error('❌ assistantId manquant, on attend.')
            console.groupEnd()
            return
        }

        /* 3. assistant tout juste créé ➜ thread neuf et mapping */
        if (SessionStorage.isAssistantCreatedForTab(tabId)) {
            SessionStorage.clearAssistantCreatedFlag(tabId)
            await createAndSaveNewThread(assistantId) // crée + mappe
            console.groupEnd()
            return
        }

        /* 4. threadId déjà stocké ? ➜ on recharge */
        const existingThreadId = initialThreadId ?? SessionStorage.getThreadIdForTab(tabId)
        if (existingThreadId) {
            try {
                const { data } = await readThread(existingThreadId)
                const t = data as unknown as LaravelThread

                const formatted: Thread = {
                    id: t.openai_id,
                    assistantId: t.assistant_openai_id,
                    module: t.module,
                    createdAt: t.created_at
                }

                setThread(formatted)
                await loadMessages(formatted.id)
                console.groupEnd()
                return // ✅
            } catch (err) {
                console.warn('⚠️ Thread stocké introuvable, mapping retiré.', err)
                SessionStorage.removeThreadIdForTab(tabId)
            }
        }

        /* 5. aucun threadId ➜ on tente de le retrouver en base */
        try {
            const found = await findThread(assistantId, module)

            // 🔽 modification ici
            if (found && typeof found === 'object' && 'openai_id' in (found as Record<string, unknown>)) {
                const t = found as unknown as LaravelThread

                const formatted: Thread = {
                    id: t.openai_id,
                    assistantId: t.assistant_openai_id,
                    module: t.module,
                    createdAt: t.created_at
                }

                setThread(formatted)
                SessionStorage.setThreadIdForTab(tabId, formatted.id) // ⬅ mapping
                await loadMessages(formatted.id)
                console.groupEnd()
                return // ✅
            }
        } catch (err: any) {
            if (err?.response?.status !== 404) {
                console.error('❌ Erreur inconnue dans findThread:', err)
            }
            // 404 = aucun thread, on continue
        }

        /* 6. toujours rien ➜ création d’un thread neuf */
        await createAndSaveNewThread(assistantId)
        console.groupEnd()
    }

    const createAndSaveNewThread = async (assistantIdToUse: string) => {
        const created = await ThreadService.createThread(assistantIdToUse, module)
        const savedResponse = await createThread(created.id, assistantIdToUse, module)

        const newThread: Thread = {
            id: savedResponse.id,
            assistantId: savedResponse.assistantId,
            module: savedResponse.module,
            createdAt: savedResponse.createdAt
        }

        setThread(newThread)
        SessionStorage.setThreadIdForTab(tabId, newThread.id)
        await loadMessages(newThread.id)
    }

    const sendMessage = async (input: string | ThreadMessageContent[], attachments?: IAFile[], options: { skipUserMessage?: boolean } = {}) => {
        if (!thread?.id) return

        setStreamedResponse('')

        const content: ThreadMessageContent[] = typeof input === 'string' ? [{ type: 'text', text: input }] : input

        const hasFile = !!attachments?.length

        const attachmentIds = attachments?.map((att) => att.id).filter(Boolean)

        const userRes = await ThreadService.sendMessageToThread(thread.id, content, 'user', attachmentIds)

        const userMessage: Message = {
            id: userRes.id,
            sender: 'user',
            content: content.find((c) => c.type === 'text')?.text ?? '',
            timestamp: new Date(userRes.created_at * 1000).toISOString(),
            threadId: thread.id,
            attachments: hasFile
                ? attachments?.map((f) => ({
                      openai_id: f.id,
                      filename: f.filename,
                      size: f.size ?? 0, // fallback ici
                      mime_type: f.mimeType ?? 'application/octet-stream' // fallback ici
                  }))
                : undefined
        }

        if (attachments?.length) {
            for (const file of attachments) {
                const fileOpenAIId = typeof file === 'string' ? file : file.id

                if (!fileOpenAIId) {
                    console.error('❌ Fichier sans ID OpenAI :', file)
                    continue
                }

                await createFileMessage({
                    file_openai_id: fileOpenAIId,
                    message_openai_id: userRes.id,
                    thread_openai_id: thread.id
                })
            }
        }


        if (!options.skipUserMessage) {
            setMessages((prev) => [...prev, userMessage])
        }

        const thinkingMessage: Message = {
            id: 'thinking',
            content: '🤖 L’assistant réfléchit...',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            threadId: thread.id
        }

        setMessages((prev) => [...prev, thinkingMessage])

        if (!hasFile) {
            let first = true
            let fullResponse = ''

            const textToUse = content.find((item) => item.type === 'text')?.text ?? ''

            fullResponse = await StreamService.startStreamingResponse(
                textToUse,
                (token) => {
                    // on ajoute le token au flux qui alimente le message « streaming »
                    setStreamedResponse((prev) => prev + token)

                    if (first) {
                        first = false

                        // on retire le placeholder une fois la mise-à-jour précédente enregistrée
                        setTimeout(() => {
                            setMessages((prev) => prev.filter((m) => m.id !== 'thinking'))
                        }, 0)
                    }
                },

                workspaceSlug,
                (name, args) => console.log('🛠️ Function call', name, args)
            )

            if (fullResponse.trim().length > 0) {
                const assistantRes = await ThreadService.sendMessageToThread(
                    thread.id,
                    [
                        {
                            type: 'text',
                            text: fullResponse
                        }
                    ],
                    'assistant'
                )

                const assistantMessage: Message = {
                    id: assistantRes.id,
                    content: fullResponse,
                    sender: 'assistant',
                    timestamp: new Date(assistantRes.created_at * 1000).toISOString(),
                    threadId: thread.id
                }

                setStreamedResponse('')
                setMessages((prev) => [...prev, assistantMessage])
            } else {
                setStreamedResponse('')
                setMessages((prev) => prev.filter((m) => m.id !== 'thinking'))
            }
        } else {
            try {
                const run = await RunService.startRun(thread.id, assistantId)

                const interval = setInterval(async () => {
                    const status = await RunService.getStatus(thread.id, run.id)

                    if (status.status === 'completed') {
                        clearInterval(interval)

                        const newMessages = await ThreadService.getMessagesFromThread(thread.id)
                        const assistantMsg = newMessages.find((msg) => msg.role === 'assistant')

                        if (assistantMsg) {
                            const assistantMessage: Message = {
                                id: assistantMsg.id,
                                content: assistantMsg.content[0]?.text?.value || '[Réponse assistant]',
                                sender: 'assistant',
                                timestamp: new Date(assistantMsg.created_at * 1000).toISOString(),
                                threadId: thread.id
                            }
                            setMessages((prev) => [...prev.filter((m) => m.id !== 'thinking'), assistantMessage])
                        }
                    } else if (status.status === 'failed') {
                        clearInterval(interval)
                        console.error('❌ Run failed')
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === 'thinking'
                                    ? {
                                          ...m,
                                          content: '❌ Erreur lors du traitement du fichier.'
                                      }
                                    : m
                            )
                        )
                    }
                }, 2000)
            } catch (err) {
                console.error('❌ Erreur lors du run assistant :', err)
            }
        }
    }

    useEffect(() => {
        //  ▸ on lance l’init seulement si aucun thread n’est encore stocké
        if (assistantId && !thread) {
            initThread().catch((err) => console.error('Erreur initThread:', err))
        }
    }, [assistantId, tabId, thread])

    return {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        thread
    }
}
