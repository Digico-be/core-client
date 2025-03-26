import { UserType } from 'types/user.types'

import { HttpService } from './index'

type ReadUsersResponse = {
    users: UserType[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}


export const readUsers = (params?: Record<string, any>) =>
    HttpService.get<{ data: ReadUsersResponse }>(`/?${new URLSearchParams(params).toString()}`)
