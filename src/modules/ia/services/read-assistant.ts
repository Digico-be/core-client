import { Assistant } from '../models/assistant'

import { HttpService } from './index'

export const readAssistant = async (openaiId: string) =>
    HttpService.get<{
        data: Assistant
    }>(`/${openaiId}`)
