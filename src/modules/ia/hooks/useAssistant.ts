import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createAssistant, destroyAssistant, readAssistants } from '../services/assistant'
import { AssistantService } from '../services/OpenAi/assistantService'
import { destroyThread } from '../services/thread'

import { Assistant } from '../models/assistant'
import { SessionStorage } from '../utils/sessions'

type OpenAiAssistant = {
    id: string
    name: string
    description?: string
    model?: string
    instructions?: string
    tools?: any[]
}

export const useAssistant = (module: string, tabId: string) => {
    const queryClient = useQueryClient()
    const [assistantOpenAiId, setAssistantOpenAiId] = useState(() => SessionStorage.getAssistantOpenAiIdForTab(tabId))

    const query = useQuery<Assistant>({
        queryKey: ['assistant', tabId],
        queryFn: async (): Promise<Assistant> => {
            const mustCreateNew = SessionStorage.isForceNewAssistant(tabId)
            if (mustCreateNew) {
                SessionStorage.clearForceNewAssistant(tabId) // on consomme le flag
            }

            /* ──────────────────────────────────────────────────────────────
             * 1.  L’onglet possède-t-il déjà un assistant mappé ?
             * ────────────────────────────────────────────────────────────── */
            const cachedId = SessionStorage.getAssistantOpenAiIdForTab(tabId)

            if (cachedId) {
                // On va directement lire cet assistant depuis la DB
                const resp = await readAssistants({ module })
                const existing: Assistant[] = Array.isArray(resp) ? resp : (resp?.data ?? [])

                const found = existing.find((a) => a.openai_id === cachedId)
                if (found) {
                    setAssistantOpenAiId(cachedId)
                    return found // ✅ même assistant, même thread
                }

                // Mapping cassé : on le retire et on poursuivra en créant un neuf
                SessionStorage.removeAssistantOpenAiIdForTab(tabId)
            }

            /* ────────────────────────────────────────────────
             * 2.  Pas (ou plus) de mapping local
             *     ➜ peut-on réutiliser un assistant existant ?
             * ──────────────────────────────────────────────── */
            if (!cachedId && !mustCreateNew) {
                // ← on bloque la réutilisation si flag
                const resp = await readAssistants({ module })
                const existing: Assistant[] = Array.isArray(resp) ? resp : (resp?.data ?? [])

                // S'il n'y en a qu'un pour ce module, on le reprend
                if (existing.length === 1) {
                    const single = existing[0]

                    SessionStorage.setAssistantOpenAiIdForTab(tabId, single.openai_id)
                    setAssistantOpenAiId(single.openai_id)

                    //  👉 signale à useChatThread qu'il NE faut PAS créer un thread neuf
                    //     (on veut récupérer l'ancien s'il existe)
                    //     donc : NE PAS poser le flag assistant_created

                    return single // ✅ anciens messages rechargés
                }
            }

            /* ────────────────────────────────────────────────
             * 3.  Création d’un nouvel assistant (cas par défaut)
             * ──────────────────────────────────────────────── */
            const nameForOA = mustCreateNew ? `${module}-${crypto.randomUUID()}` : module
            const newOA = (await AssistantService.createAssistant(nameForOA)) as unknown as OpenAiAssistant

            const saved = await createAssistant({
                openai_id: newOA.id,
                name: newOA.name,
                description: newOA.description ?? '',
                module,
                model: newOA.model,
                instructions: newOA.instructions,
                tools: newOA.tools
            })

            SessionStorage.setAssistantOpenAiIdForTab(tabId, saved.openai_id)
            SessionStorage.setAssistantCreatedForTab(tabId) // ⬅ thread neuf obligatoire
            setAssistantOpenAiId(saved.openai_id)

            return saved
        },
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!assistantOpenAiId) return

            await destroyAssistant(assistantOpenAiId)

            const threadId = SessionStorage.getThreadIdForTab(tabId)
            if (threadId) {
                try {
                    await destroyThread(threadId)
                } catch (err) {
                    console.warn('⚠️ Erreur suppression du thread:', err)
                }
                SessionStorage.removeThreadIdForTab(tabId)
            }
        },
        onSuccess: () => {
            SessionStorage.removeAssistantOpenAiIdForTab(tabId)
            setAssistantOpenAiId(null)
            queryClient.removeQueries({ queryKey: ['assistant', tabId] })
        },
        onError: (error) => {
            console.error("Erreur lors de la suppression de l'assistant:", error)
        }
    })

    return {
        ...query,
        deleteAssistant: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        deletionError: deleteMutation.error
    }
}
