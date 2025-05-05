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
    const [assistantOpenAiId, setAssistantOpenAiId] = useState(() =>
        SessionStorage.getAssistantOpenAiIdForTab(tabId)
    )

    const query = useQuery<Assistant>({
        queryKey: ['assistant', tabId],
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000,
        queryFn: async (): Promise<Assistant> => {
            const mustCreateNew = SessionStorage.isForceNewAssistant(tabId)
            if (mustCreateNew) {
                SessionStorage.clearForceNewAssistant(tabId)
            }

            const cachedId = SessionStorage.getAssistantOpenAiIdForTab(tabId)

            // ─── Cas 1 : assistant déjà mappé localement ───
            if (cachedId) {
                const all = await readAssistants({ module })
                const assistants: Assistant[] = Array.isArray(all) ? all : all?.data ?? []

                const existing = assistants.find(a => a.openai_id === cachedId)
                if (existing) {
                    setAssistantOpenAiId(cachedId)
                    return existing
                }

                SessionStorage.removeAssistantOpenAiIdForTab(tabId)
            }

            // ─── Cas 2 : réutilisation possible d'un assistant existant ───
            if (!cachedId && !mustCreateNew) {
                const resp = await readAssistants()
                const all: Assistant[] = Array.isArray(resp) ? resp : resp?.data ?? []

                const available = all
                    .filter(a => a.module === module)
                    .find(a => !Object.values(SessionStorage.getAssistantOpenAiIdMapping()).includes(a.openai_id))

                if (available) {
                    SessionStorage.setAssistantOpenAiIdForTab(tabId, available.openai_id)
                    setAssistantOpenAiId(available.openai_id)
                    return available
                }
            }

            // ─── Cas 3 : création d’un nouvel assistant ───
            const assistantName = mustCreateNew ? `${module}-${crypto.randomUUID()}` : module
            const newOA = (await AssistantService.createAssistant(assistantName)) as OpenAiAssistant

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
            SessionStorage.setAssistantCreatedForTab(tabId)
            setAssistantOpenAiId(saved.openai_id)

            return saved
        }
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
