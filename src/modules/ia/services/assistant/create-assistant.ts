import { Assistant } from '../../models/assistant'

import { HttpService } from './index'

export const createAssistant = async (assistant: Assistant) => {
    if (!assistant.openai_id) {
        console.error("❌ openai_id manquant dans le payload Laravel")
        throw new Error("Impossible de créer l'assistant Laravel sans openai_id")
    }

    return HttpService.post<Assistant>('/', assistant)
}



