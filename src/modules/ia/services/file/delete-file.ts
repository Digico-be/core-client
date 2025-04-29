import { HttpService } from '../thread'

export const deleteFile = async (id: string) => {
    return await HttpService.delete(`/${id}`)
}
