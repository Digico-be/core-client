import { HttpService } from './index'

export const attachModule = (moduleId: number, userId: number) =>
    HttpService.post(`/${moduleId}/attach`, {
        user_id: userId
    })
