import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAssistant } from '../services/assistant'

import { Assistant } from '../models/assistant'

export const useUpdateAssistant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Assistant) => updateAssistant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assistants'] })
        }
    })
}
