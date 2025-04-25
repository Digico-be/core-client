import { Thread } from '../../models/thread'

import { HttpService } from './index'

export const readThread = async (openaiId: string) =>
    HttpService.get<{
        data: Thread
    }>(`/${openaiId}`)
