import { useMutation } from '@tanstack/react-query'
import { createUser, CreateUserPayload } from '../../services/user/create-user'

export const useCreateUser = () => {
    return useMutation({
        mutationFn: (data: CreateUserPayload) => createUser(data),
    })
}
