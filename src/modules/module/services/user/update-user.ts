import { UserType } from 'types/user.types'

import { HttpService } from './index'

export const updateUser = (userId: number, data: Partial<UserType>) =>
    HttpService.put<UserType>(`/${userId}`, data)
