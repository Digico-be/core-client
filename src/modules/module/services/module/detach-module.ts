import { HttpService } from './index'

export const detachModule = (moduleId: number, userId: number) =>
    HttpService.post(`/${moduleId}/detach`, {
        user_id: userId
    })
