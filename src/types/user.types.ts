export interface UserType {
    id: number
    firstname: string
    lastname: string
    email: string
    role?: UserRole
}

export type UserRole = 'guest' | 'customer' | 'personnal' | 'admin'


