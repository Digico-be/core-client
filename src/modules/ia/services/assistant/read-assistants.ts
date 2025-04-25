import { Assistant } from '../../models/assistant'

import { HttpService } from './index'

export const readAssistants = async (params?: Record<string, any>) =>
    HttpService.get<{
        data: Assistant[]
    }>(`/`, params)
