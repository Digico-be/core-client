import { Assistant } from '../models/assistant'

import { HttpService } from './index'

export const createAssistant = async (data: Assistant) =>
    HttpService.post<{
        data: Assistant
    }>(`/`, data)
