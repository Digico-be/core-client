import { HttpService } from './index'

export const createFileMessage = async (payload: {
    file_openai_id: string
    message_openai_id: string
    thread_openai_id?: string
}) => {
    return await HttpService.post('/', payload)
}
