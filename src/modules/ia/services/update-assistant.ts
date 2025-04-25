import { Assistant } from '../models/assistant'

import { HttpService } from './index'

export const updateAssistant = async ({ openai_id, ...data }: Partial<Omit<Assistant, 'id'>> & { openai_id: string }) =>
    HttpService.put<{
        data: Assistant
    }>(`/${openai_id}`, data)
