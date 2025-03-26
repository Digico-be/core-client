'use client'

import { useMutation } from '@tanstack/react-query'

import { attachModule } from '../../services/module'

export const useAttachModule = () => {
    return useMutation({
        mutationFn: ({ moduleId, userId }: { moduleId: number; userId: number }) =>
            attachModule(moduleId, userId)
    })
}
