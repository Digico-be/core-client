import { HttpService } from './index'

export const deleteMessage = async (openaiId: string) =>
    HttpService.delete(`/` + encodeURIComponent(openaiId))
