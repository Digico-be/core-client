import { HttpService } from './index'

export const deleteUser = (userId: number) => {
    return HttpService.delete(`/${userId}`)
}
