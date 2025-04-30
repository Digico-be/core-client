import { FileMessageLink } from '../../types/fileMessageLink'

import { HttpService } from './index'

export const readsFileMessages = async (threadOpenaiId: string): Promise<FileMessageLink[]> => {
    const response = await HttpService.get<{ data: FileMessageLink[] }>(`?thread_openai_id=${threadOpenaiId}`)
    return response.data
}
