'use client'

import { useMutation } from '@tanstack/react-query'

import { detachModule } from '../../services/module'

export const useDetachModule = () => {
    return useMutation({
        mutationFn: ({ moduleId, userId }: { moduleId: number; userId: number }) =>
            detachModule(moduleId, userId)
    })
}
