import { HttpService } from './index'

export const readFile = async (id: string) => {
    return await HttpService.get(`/${id}`)
}
