import { Assistant } from '../../models/assistant'

import { HttpService } from './index'

export interface ReadAssistantsParams {
    module?: string
    name?: string
}

export const readAssistants = async (
    params: ReadAssistantsParams = {}
): Promise<Assistant[]> => {
    const { data } = await HttpService.get<{ data: Assistant[] }>('/', params)
    return data
}
