import { HttpService } from './index'

export const destroyAssistant = async (id: number) => HttpService.delete(`/${id}`)
