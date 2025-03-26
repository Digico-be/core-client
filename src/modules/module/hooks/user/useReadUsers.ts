'use client'

import { useQuery } from '@tanstack/react-query'

import { readUsers } from '../../services/user'

export const useReadUsers = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => readUsers(params)
    })
}
