import { useMutation } from '@tanstack/react-query'

import { forgotPassword } from 'services/auth/forgotPassword'

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword
    })
}
