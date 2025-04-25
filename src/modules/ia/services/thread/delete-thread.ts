import { HttpService } from './index'

export const destroyThread = async (openaiId: string) => HttpService.delete(`/${openaiId}`)
