import { useCallback, useState } from 'react'

import { StreamService } from '../services/OpenAi/streamService'

export function useStreamAssistantResponse(workspaceSlug: string, module: string) {
    const [streamedResponse, setStreamedResponse] = useState('')

    const stream = useCallback(
        async (prompt: string, onToken?: (tok: string) => void): Promise<string> => {
            setStreamedResponse('')
            let first = true

            const full = await StreamService.startStreamingResponse(
                prompt,
                tok => {
                    setStreamedResponse(prev => prev + tok)
                    onToken?.(tok)
                    if (first) first = false
                },
                workspaceSlug,
                module // <-- Ajout ici
            )

            setStreamedResponse('')
            return full
        },
        [workspaceSlug, module]
    )

    return { streamedResponse, stream }
}

