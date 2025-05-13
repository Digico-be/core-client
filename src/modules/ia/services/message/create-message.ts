import { HttpService } from './index'

/**
 * Crée un message "brut" dans la table messages + pivots file_messages
 */
export const createMessage = async (payload: {
    openai_id: string
    thread_openai_id: string
    role: 'user' | 'assistant'
    raw_text: string
    attachments?: {
        file_openai_id: string
        filename: string
        size: number
        mime_type: string
    }[]
}) => {
    return HttpService.post<{ data: any }>('/', payload)
}
