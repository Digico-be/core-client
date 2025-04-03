import { LoginFormData } from 'types/auth.types'

import { HttpService } from '.'

export const login = (data: LoginFormData) => HttpService.post(`/auth/login`, data)

