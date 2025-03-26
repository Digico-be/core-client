'use client'

import { useQuery } from '@tanstack/react-query'
import { getAuthenticatedUser } from '../../../../services/auth'

export const useAuthenticatedUser = () => {
    return useQuery({
        queryKey: ['authenticated-user'],
        queryFn: () => getAuthenticatedUser(),
    })
}
