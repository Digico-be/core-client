import { HttpService } from './index'

/**
 * GET /api/messages?thread_openai_id=…
 * - Renvoie toujours un tableau JSON (peut être vide).
 * - Si le thread n’existe pas encore → 404  → on renvoie [].
 */
export const readMessages = async (threadOpenAiId: string) => {
    try {
        const res = await HttpService.get<any>(
            `/?thread_openai_id=${encodeURIComponent(threadOpenAiId)}`
        )

        return Array.isArray(res) ? res : res?.data ?? []
    } catch (err: any) {
        if (err?.status === 404) return []          // Aucun message encore enregistré
        throw err
    }
}
