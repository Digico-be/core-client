import { UserRole,UserType } from 'types/user.types'

import { HttpService } from './index'

export type CreateUserPayload = {
    firstname: string
    lastname: string
    email: string
    password: string
    role: UserRole
}

export const createUser = (data: CreateUserPayload) =>
    HttpService.post<{ user: UserType }>(``, data)
