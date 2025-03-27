'use client'

import { useQuery } from '@tanstack/react-query'

import { readUser } from '../../services/user/read-user'

export const useReadUser = (userId: number) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => readUser(userId),
        enabled: !!userId,
    })
}
