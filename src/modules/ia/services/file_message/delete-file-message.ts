import { HttpService } from './index'

export const deleteFileMessage = async (messageId: string) => {
    return await HttpService.delete(`/message/${messageId}`)
}
