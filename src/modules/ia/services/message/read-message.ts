import { HttpService } from './index'

/**
 * Récupère l’historique «brut» d’un thread.
 * @param threadOpenAiId id OpenAI du thread
 */
export const readMessages = async (threadOpenAiId: string) =>
    HttpService.get<{ data: any[] }>(`?thread_openai_id=${threadOpenAiId}`)
