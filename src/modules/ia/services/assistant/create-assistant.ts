import { Assistant } from '../../models/assistant'

import { HttpService } from './index'

export const createAssistant = async (assistant: Assistant) =>
    HttpService.post<Assistant>('/', assistant);


