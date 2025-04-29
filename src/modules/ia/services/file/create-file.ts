import { Attachment } from '../../models/attachment'

import { HttpService } from './index'

export const createFile = async (file: Attachment) => {
    const payload = {
        openai_id: file.openai_id,
        filename: file.filename,
        size: file.size,
        mime_type: file.mime_type
    }

    return await HttpService.post('/', payload)
}
