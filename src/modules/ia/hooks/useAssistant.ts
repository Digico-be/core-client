import {useState} from "react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AssistantService } from '../services/OpenAi/assistantService'

import { SessionStorage } from '../utils/sessions'



export const useAssistant = (module: string, tabId: string) => {
    const queryClient = useQueryClient();
    const [assistantId, setAssistantId] = useState(() => SessionStorage.getAssistantIdForTab(tabId));

    const query = useQuery({
        queryKey: ['assistant', tabId],
        queryFn: async () => {
            if (assistantId) {
                return await AssistantService.getAssistantById(assistantId);
            }
            const assistant = await AssistantService.createAssistant(module);
            SessionStorage.setAssistantIdForTab(tabId, assistant.id);
            setAssistantId(assistant.id);
            return assistant;
        },
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => AssistantService.deleteAssistant(id),
        onSuccess: () => {
            SessionStorage.removeAssistantIdForTab(tabId);
            setAssistantId(null);
            queryClient.removeQueries({ queryKey: ['assistant', tabId] });
        },
    });

    return {
        ...query,
        deleteAssistant: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        deletionError: deleteMutation.error,
    };
};

