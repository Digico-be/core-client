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

export const useAssistant = (module: string, tabId: string, type: string) => {
    const queryClient = useQueryClient()
    const [assistantOpenAiId, setAssistantOpenAiId] = useState(() => SessionStorage.getAssistantOpenAiIdForTab(tabId))

    const query = useQuery<Assistant>({
        queryKey: ['assistant', tabId],
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000,
        queryFn: async (): Promise<Assistant> => {
            const forceNew = SessionStorage.isForceNewAssistant(tabId)

            const all = await readAssistants({ module })
            const assistants: Assistant[] = Array.isArray(all) ? all : (all?.data ?? [])

            // ─── 1. Réutiliser l’assistant existant si possible ───
            if (!forceNew && assistants.length > 0) {
                const existing = assistants[0]
                SessionStorage.setAssistantOpenAiIdForTab(tabId, existing.openai_id)
                setAssistantOpenAiId(existing.openai_id)
                return existing
            }

            // ─── 2. Sinon, créer un nouvel assistant ───
            const assistantName = module
            const newOA = (await AssistantService.createAssistant(assistantName)) as OpenAiAssistant

            // Configuration spéciale pour Radar
            const isRadar = module === 'radar'
            const saved = await createAssistant({
                openai_id: newOA.id,
                name: isRadar ? 'Radar' : newOA.name,
                description: newOA.description ?? '',
                module,
                model: newOA.model,
                instructions: isRadar
                    ? `Tu es un assistant spécialisé dans la recherche et l'analyse d'informations publiques sur des entreprises à l'aide d'Internet.
Ton objectif est d'aider l'utilisateur à obtenir des données fiables, à jour et utiles sur une entreprise donnée, comme :
Nom, secteur, description de l’activité
Taille de l’entreprise (effectif, chiffre d’affaires si public)
Adresse du siège social
Responsables (CEO, fondateurs, etc.)
Informations de contact (site web, téléphone, email professionnel si disponible)
Réseaux sociaux et actualités récentes
Tu dois :
Prioriser les sources fiables comme le site officiel de l’entreprise, companyweb.be,  Crunchbase, Societe.com, Infogreffe, etc.
Résumer les informations clairement.
Indiquer si certaines données sont indisponibles ou incertaines mais ne pas mettre null.
Refuser toute recherche qui violerait la vie privée ou les politiques d’usage (ex : données personnelles non publiques).
Si l’entreprise n’existe pas ou est trop peu connue, indique-le poliment. Si la demande est ambiguë, demande des précisions.
Tu es toujours courtois, synthétique et orienté efficacité.`
                    : newOA.instructions,
                tools: isRadar
                    ? [{ type: 'web_search_preview' }]
                    : newOA.tools,
                type: module === 'radar' ? 'specialized' : (type as 'specialized' | 'general')
            })

            SessionStorage.setAssistantOpenAiIdForTab(tabId, saved.openai_id)
            SessionStorage.setAssistantCreatedForTab(tabId)

            if (forceNew) {
                SessionStorage.clearForceNewAssistant(tabId)
            }

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
