import { useQuery } from '@tanstack/react-query'

import { readAssistants } from '../services/assistant'


export const useReadAssistants = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['assistants', params],
        queryFn: () => readAssistants(params),
    })
}
