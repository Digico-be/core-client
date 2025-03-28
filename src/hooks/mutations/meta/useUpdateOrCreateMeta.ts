'use client'

import { queryClient } from '@digico/utils'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateOrCreateMeta } from 'services/meta/update-or-create-meta'

export const useUpdateOrCreateMeta = () => {
    return useMutation({
        mutationFn: updateOrCreateMeta,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['metas']
            })
        }
    })
}
