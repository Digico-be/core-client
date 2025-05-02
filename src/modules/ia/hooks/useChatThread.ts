import { useEffect, useState } from 'react'

import { createFileMessage } from '../services/file_message'
import { RunService } from '../services/OpenAi/runService'
import { StreamService } from '../services/OpenAi/streamService'
import { ThreadService } from '../services/OpenAi/threadService'
import { createThread, destroyThread, findThread, readThread } from '../services/thread'

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

/**
 * Hook de gestion d'un thread de conversation OpenAI <-> Laravel
 */
export const useChatThread = (tabId: string, assistantId: string, module: string, workspaceSlug: string, initialThreadId?: string) => {
    const [thread, setThread] = useState<Thread | null>(null)
    const [streamedResponse, setStreamedResponse] = useState<string>('')

    const { messages, setMessages, loadMessages, deleteMessage, editMessage } = useThreadMessages()

    /**
     * Supprime un thread : OpenAI, Laravel, puis nettoyage local
     */
    const removeThread = async (threadIdToRemove: string) => {
        // 1. Supprimer sur OpenAI
        try {
            await ThreadService.deleteThread(threadIdToRemove)
        } catch (err) {
            console.error('Erreur lors de la suppression du thread sur OpenAI :', err)
        }

        // 2. Supprimer en base Laravel
        try {
            await destroyThread(threadIdToRemove)
        } catch (err) {
            console.error('Erreur lors de la suppression du thread en Laravel :', err)
        }

        // 3. Nettoyer le state & sessionStorage
        SessionStorage.removeThreadIdForTab(tabId)
        setThread(null)
    }

    /**
     * Initialise ou recharge le thread actif
     */
    const initThread = async () => {
        console.group(`[Tab ${tabId}] initThread`)

        // 1) Thread déjà chargé ?
        if (thread) {
            console.log('⏭ Thread déjà présent, on sort.')
            console.groupEnd()
            return
        }

        // 2) Attente de assistantId
        if (!assistantId) {
            console.error('❌ assistantId manquant, on attend.')
            console.groupEnd()
            return
        }

        // 3) Nouveau assistant ➜ thread frais
        if (SessionStorage.isAssistantCreatedForTab(tabId)) {
            SessionStorage.clearAssistantCreatedFlag(tabId)
            await createAndSaveNewThread(assistantId)
            console.groupEnd()
            return
        }

        // 4) Thread existant en session ou forcé
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
                return
            } catch (err) {
                console.warn('⚠️ Thread stocké introuvable, mapping retiré.', err)
                SessionStorage.removeThreadIdForTab(tabId)
            }
        }

        // 5) Recherche automatique par assistant+module
        try {
            const found = await findThread(assistantId, module)
            if (found?.id) {
                const t = found as unknown as LaravelThread

                const formatted: Thread = {
                    id: t.openai_id,
                    assistantId: t.assistant_openai_id,
                    module: t.module,
                    createdAt: t.created_at
                }

                setThread(formatted)
                SessionStorage.setThreadIdForTab(tabId, formatted.id)
                await loadMessages(formatted.id)
                console.groupEnd()
                return
            } else {
                console.info(`[useChatThread] Aucun thread trouvé pour assistant=${assistantId}, création en cours.`)
            }
        } catch (err: any) {
            if (err?.response?.status !== 404) {
                console.error('❌ Erreur inconnue dans findThread:', err)
            }
        }

        // 6) Création d’un thread frais
        await createAndSaveNewThread(assistantId)
        console.groupEnd()
    }

    /**
     * Crée un nouveau thread OpenAI + Laravel, l’affiche et le stocke
     */
    const createAndSaveNewThread = async (assistantIdToUse: string): Promise<Thread> => {
        const created = await ThreadService.createThread(assistantIdToUse, module);
        console.log('[useChatThread] OpenAI thread créé:', created.id); // Assure-toi que l'ID est bien ici

        const savedResponse = await createThread(created.id, assistantIdToUse, module);
        console.log('[useChatThread] Laravel thread enregistré:', savedResponse.id); // Vérifie l'ID renvoyé par Laravel

        const newThread: Thread = {
            id: savedResponse.id,
            assistantId: savedResponse.assistantId,
            module: savedResponse.module,
            createdAt: savedResponse.createdAt,
        };

        console.log('Thread après création:', newThread); // Vérifie le contenu du thread

        setThread(newThread); // Mise à jour du state avec le thread créé
        SessionStorage.setThreadIdForTab(tabId, newThread.id); // Mise à jour du sessionStorage
        await loadMessages(newThread.id); // Chargement des messages

        return newThread;
    };


    /**
     * Envoie un message (texte ou fichier) vers OpenAI, puis stocke le message et la réponse
     */
    const sendMessage = async (input: string | ThreadMessageContent[], attachments?: IAFile[], options: { skipUserMessage?: boolean } = {}) => {
        if (!thread?.id) return

        setStreamedResponse('')

        const content: ThreadMessageContent[] = typeof input === 'string' ? [{ type: 'text', text: input }] : input

        const hasFile = !!attachments?.length
        const attachmentIds = attachments?.map((att) => att.id).filter(Boolean)

        // 1) on envoie le message utilisateur
        const userRes = await ThreadService.sendMessageToThread(thread.id, content, 'user', attachmentIds)

        // 2) on stocke localement le message user
        const userMessage: Message = {
            id: userRes.id,
            sender: 'user',
            content: content.find((c) => c.type === 'text')?.text ?? '',
            timestamp: new Date(userRes.created_at * 1000).toISOString(),
            threadId: thread.id,
            attachments: hasFile
                ? attachments!.map((f) => ({
                      openai_id: f.id,
                      filename: f.filename,
                      size: f.size ?? 0,
                      mime_type: f.mimeType ?? 'application/octet-stream'
                  }))
                : undefined
        }

        // 3) associe les fichiers si présents
        if (attachments?.length) {
            for (const file of attachments) {
                await createFileMessage({
                    file_openai_id: file.id,
                    message_openai_id: userRes.id,
                    thread_openai_id: thread.id
                })
            }
        }

        if (!options.skipUserMessage) {
            setMessages((prev) => [...prev, userMessage])
        }

        // 4) message de réflexion
        const thinkingMessage: Message = {
            id: 'thinking',
            content: '🤖 L’assistant réfléchit...',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            threadId: thread.id
        }
        setMessages((prev) => [...prev, thinkingMessage])

        // 5) streaming ou run selon attachment
        if (!hasFile) {
            // streaming textuel
            let first = true
            setStreamedResponse('')
            const fullResponse = await StreamService.startStreamingResponse(
                content.find((c) => c.type === 'text')?.text ?? '',
                (token) => {
                    setStreamedResponse((prev) => prev + token)
                    if (first) {
                        first = false
                        setTimeout(() => {
                            setMessages((p) => p.filter((m) => m.id !== 'thinking'))
                        }, 0)
                    }
                },
                workspaceSlug,
                (name, args) => console.log('🛠️ Function call', name, args)
            )
            // ajouter la réponse finale
            if (fullResponse.trim()) {
                const assistantRes = await ThreadService.sendMessageToThread(thread.id, [{ type: 'text', text: fullResponse }], 'assistant')
                const assistantMessage: Message = {
                    id: assistantRes.id,
                    sender: 'assistant',
                    content: fullResponse,
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
            // run via fichier
            try {
                const run = await RunService.startRun(thread.id, assistantId)
                const interval = setInterval(async () => {
                    const status = await RunService.getStatus(thread.id, run.id)
                    if (status.status === 'completed') {
                        clearInterval(interval)
                        const allMsgs = await ThreadService.getMessagesFromThread(thread.id)
                        const msg = allMsgs.find((m) => m.role === 'assistant')
                        if (msg) {
                            const assistantMessage: Message = {
                                id: msg.id,
                                sender: 'assistant',
                                content: msg.content[0]?.text?.value || '',
                                timestamp: new Date(msg.created_at * 1000).toISOString(),
                                threadId: thread.id
                            }
                            setMessages((prev) => [...prev.filter((m) => m.id !== 'thinking'), assistantMessage])
                        }
                    } else if (status.status === 'failed') {
                        clearInterval(interval)
                        setMessages((prev) => prev.map((m) => (m.id === 'thinking' ? { ...m, content: '❌ Erreur lors du traitement du fichier.' } : m)))
                    }
                }, 2000)
            } catch (err) {
                console.error('❌ Erreur lors du run assistant :', err)
            }
        }
    }

    // Lancement de l'init au démarrage ou au changement d'assistantId/tab
    useEffect(() => {
        const alreadyCreated = SessionStorage.isAssistantCreatedForTab(tabId);
        if (!thread && assistantId && (initialThreadId || alreadyCreated)) {
            initThread().catch((e) => console.error('Erreur initThread:', e));
        }
    }, [assistantId, tabId, thread, initialThreadId]);


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
