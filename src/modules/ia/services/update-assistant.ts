import { Assistant } from '../models/assistant'

import { HttpService } from './index'

export const updateAssistant = async ({ id, ...data }: Partial<Omit<Assistant, 'id'>> & { id: Assistant['id'] }) =>
    HttpService.put<{
        data: Assistant
    }>(`/${id}`, data)
