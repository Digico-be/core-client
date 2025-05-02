// src/modules/ia/services/thread/find-thread.ts

import { Thread } from '../../models/thread'

import { HttpService } from './index'

/**
 * Tente de récupérer un thread existant côté Laravel.
 * En cas d’erreur (404 ou autre), on log et on renvoie null.
 */
export async function findThread(
    assistantOpenAiId: string,
    module?: string
): Promise<Thread | null> {
    const params = new URLSearchParams({ assistant_openai_id: assistantOpenAiId })
    if (module) params.append('module', module)
    const relativePath = `/find?${params.toString()}`

    console.debug('[findThread] GET', relativePath)

    try {
        const thread = await HttpService.get<Thread>(relativePath)
        console.debug('[findThread] trouvé:', thread)
        return thread
    } catch (err: any) {
        // On logge l’erreur complète
        console.warn('[findThread] aucune entrée trouvée ou erreur :', {
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data
        })

        return null
    }
}
