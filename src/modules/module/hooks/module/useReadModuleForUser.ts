'use client'

import { useQuery } from '@tanstack/react-query'

import { readModulesForUser } from '../../services/module'

export const useReadModulesForUser = (userId: number) => {
    return useQuery({
        queryKey: ['modules-for-user', userId],
        queryFn: () => readModulesForUser(userId),
        enabled: !!userId
    })
}
