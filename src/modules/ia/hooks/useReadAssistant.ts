import { useQuery } from '@tanstack/react-query'

import { readAssistant } from '../services/assistant'
export const useReadAssistant = (openaiId: string) => {
    return useQuery({
        queryKey: ['assistant', openaiId],
        queryFn: () => readAssistant(openaiId),
        enabled: !!openaiId,
    })
}
