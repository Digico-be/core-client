'use client'

import { useQuery } from '@tanstack/react-query'

import { readModules } from '../../services/module'

export const useReadModules = () => {
    return useQuery({
        queryKey: ['modules'],
        queryFn: () => readModules()
    })
}
