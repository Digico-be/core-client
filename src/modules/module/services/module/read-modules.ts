import { HttpService } from '../module'

export type ModuleType = {
    id: number
    name: string
}

export const readModules = async () => {
    try {
        return await HttpService.get<ModuleType[]>('/')
    } catch (error) {
        throw error
    }
}