import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createAssistant, destroyAssistant, readAssistant } from '../services';
import { AssistantService } from '../services/OpenAi/assistantService';

import { Assistant } from '../models/assistant';
import { SessionStorage } from '../utils/sessions';

type OpenAiAssistant = {
    id: string;
    name: string;
    description?: string;
    model?: string;
    instructions?: string;
    tools?: any[];
};

/**
 * Hook pour gérer les assistants, utilisant sessionStorage et l'API Laravel.
 */
export const useAssistant = (module: string, tabId: string) => {
    const queryClient = useQueryClient();
    const [assistantOpenAiId, setAssistantOpenAiId] = useState(() =>
        SessionStorage.getAssistantOpenAiIdForTab(tabId)
    );

    const query = useQuery<Assistant>({
        queryKey: ['assistant', tabId],
        queryFn: async () => {
            let assistant;

            if (assistantOpenAiId) {
                const storedAssistant = await readAssistant(assistantOpenAiId);
                assistant = storedAssistant;
            } else {
                // Création côté OpenAI
                const newAssistant = (await AssistantService.createAssistant(module)) as unknown as OpenAiAssistant

                const saved = await createAssistant({
                    openai_id: newAssistant.id,
                    name: newAssistant.name,
                    description: newAssistant.description ?? '',
                    module,
                    model: newAssistant.model,
                    instructions: newAssistant.instructions,
                    tools: newAssistant.tools,
                });

                SessionStorage.setAssistantOpenAiIdForTab(tabId, saved.openai_id);
                setAssistantOpenAiId(saved.openai_id);

                assistant = saved;

            }

            return 'data' in assistant ? assistant.data : assistant;
        },
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!assistantOpenAiId) return;
            await destroyAssistant(assistantOpenAiId);
        },
        onSuccess: () => {
            SessionStorage.removeAssistantOpenAiIdForTab(tabId);
            setAssistantOpenAiId(null);
            queryClient.removeQueries({ queryKey: ['assistant', tabId] });
        },
        onError: (error) => {
            console.error("Erreur lors de la suppression de l'assistant:", error);
        },
    });

    return {
        ...query,
        deleteAssistant: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        deletionError: deleteMutation.error,
    };
};
