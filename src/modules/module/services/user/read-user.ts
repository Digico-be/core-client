import { UserType } from '../../../../types/user.types'

import { HttpService } from './index'

export const readUser = (userId: number) =>
    HttpService.get<UserType>(`/${userId}`)
