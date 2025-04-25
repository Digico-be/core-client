import { HttpService } from './index'

export const destroyAssistant = async (openaiId: string) => HttpService.delete(`/${openaiId}`)
