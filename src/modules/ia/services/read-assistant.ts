import { Assistant } from '../models/assistant'

import { HttpService } from './index'

export const readAssistant = async (id: number) =>
    HttpService.get<{
        data: Assistant
    }>(`/${id}`)
