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
                // 1) on récupère TOUS les assistants de l’utilisateur
                const resp = await readAssistants();           // ⬅️  plus de filtre côté API
                const all: Assistant[] = Array.isArray(resp) ? resp : resp?.data ?? [];

                // 2) on garde uniquement ceux du même module
                const existing = all.filter(a => a.module === module);

                // 3) on élimine ceux déjà mappés à un onglet ouvert
                const usedIds = Object.values(SessionStorage.getAssistantOpenAiIdMapping());
                const available = existing.find(a => !usedIds.includes(a.openai_id));

                if (available) {
                    SessionStorage.setAssistantOpenAiIdForTab(tabId, available.openai_id);
                    setAssistantOpenAiId(available.openai_id);

                    // pas de flag assistant_created → useChatThread tentera
                    // de reprendre l’ancien thread s’il existe
                    return available;
                }
            }




            /* ────────────────────────────────────────────────
             * 3.  Création d’un nouvel assistant (cas par défaut)
             * ──────────────────────────────────────────────── */
            const nameForOA = mustCreateNew ? `${module}-${crypto.randomUUID()}` : module
            const newOA = (await AssistantService.createAssistant(nameForOA)) as unknown as OpenAiAssistant

            console.log('✅ Payload envoyé à Laravel (createAssistant):', {
                openai_id: newOA.id,
                name: newOA.name,
                description: newOA.description ?? '',
                module,
                model: newOA.model,
                instructions: newOA.instructions,
                tools: newOA.tools
            })

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
