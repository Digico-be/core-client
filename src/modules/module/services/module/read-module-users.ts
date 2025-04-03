import { HttpService, ModuleType } from './index'

export const readModulesForUser = (userId: number) =>
    HttpService.get<ModuleType[]>(`/user/${userId}`)
