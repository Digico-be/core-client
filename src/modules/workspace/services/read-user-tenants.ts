import { HttpService } from './index'

export const readUserTenants = () =>
    HttpService.get<{ tenants: { id: string; name: string; role: string }[] }>(`/tenants`)
