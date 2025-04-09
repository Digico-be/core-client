import { TenantType } from './tenant.types'
import { UserType } from './user.types'

export interface LoginFormData {
    email: string
    password: string
    remember: boolean
}

export interface AuthResponse {
    access_token: string
    expires_in: number
    token_type: 'Bearer' | 'JWT'
    user: UserType
    tenant: TenantType
}

export interface ResetPasswordFormData {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}
