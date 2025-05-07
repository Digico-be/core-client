import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAssistant as updateLaravelAssistant } from '../services/assistant'
import { AssistantService } from '../services/OpenAi/assistantService'

import { Assistant } from '../models/assistant'

export const useUpdateAssistant = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: Assistant) => {
            // Étape 1 : mettre à jour sur OpenAI
            AssistantService.updateAssistant(data.openai_id, data)

            // Étape 2 : mettre à jour Laravel
            return await updateLaravelAssistant(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assistants'] })
        }
    })
}
