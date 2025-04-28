import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createAssistant, destroyAssistant, readAssistants } from '../services/assistant';
import { AssistantService } from '../services/OpenAi/assistantService';
import { destroyThread } from '../services/thread';

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

export const useAssistant = (module: string, tabId: string) => {
    const queryClient = useQueryClient();
    const [assistantOpenAiId, setAssistantOpenAiId] = useState(() =>
        SessionStorage.getAssistantOpenAiIdForTab(tabId)
    );

    const query = useQuery<Assistant>({
        queryKey: ['assistant', tabId],
        queryFn: async (): Promise<Assistant> => {
            let assistant: Assistant;

            const existingAssistants = await readAssistants({ module });

            if (Array.isArray(existingAssistants) && existingAssistants.length > 0) {
                const matchingAssistant = existingAssistants[0];
                SessionStorage.setAssistantOpenAiIdForTab(tabId, matchingAssistant.openai_id);
                setAssistantOpenAiId(matchingAssistant.openai_id);
                assistant = matchingAssistant;
            } else {
                const newAssistant = (await AssistantService.createAssistant(module)) as unknown as OpenAiAssistant;

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
                SessionStorage.setAssistantCreatedForTab(tabId);
                setAssistantOpenAiId(saved.openai_id);

                assistant = saved;
            }

            console.groupEnd();
            return assistant;
        },
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000,
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!assistantOpenAiId) return;

            await destroyAssistant(assistantOpenAiId);

            const threadId = SessionStorage.getThreadIdForTab(tabId);
            if (threadId) {
                try {
                    await destroyThread(threadId);
                } catch (err) {
                    console.warn("⚠️ Erreur suppression du thread:", err);
                }
                SessionStorage.removeThreadIdForTab(tabId);
            }
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
