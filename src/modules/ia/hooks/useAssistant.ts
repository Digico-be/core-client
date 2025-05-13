import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createAssistant,
    destroyAssistant,
    readAssistants,
} from '../services/assistant';
import { AssistantService } from '../services/OpenAi/assistantService';
import { destroyThread } from '../services/thread';

import { Assistant } from '../models/assistant';
import { getAssistantTemplate } from '../utils/getAssistantTemplate'
import { SessionStorage } from '../utils/sessions';

type OpenAiAssistant = {
    id: string;
    name: string;
    description?: string;
    model?: string;
    instructions?: string;
    tools?: any[];
};

export const useAssistant = (
    module: string,
    tabId: string,
    type: 'general' | 'specialized' | 'radar',
) => {
    const queryClient = useQueryClient();
    const [assistantOpenAiId, setAssistantOpenAiId] = useState(() =>
        SessionStorage.getAssistantOpenAiIdForTab(tabId),
    );

    const query = useQuery<Assistant>({
        queryKey: ['assistant', tabId],
        enabled: !!module && !!tabId,
        staleTime: 5 * 60 * 1000,
        queryFn: async (): Promise<Assistant> => {
            const forceNew = SessionStorage.isForceNewAssistant(tabId);

            const all = await readAssistants({ module });
            const assistants: Assistant[] = Array.isArray(all) ? all : all?.data ?? [];

            const forcedType: 'general' | 'radar' | 'specialized' =
                module === 'radar' ? 'radar' : type;

            const template = getAssistantTemplate(forcedType, module);
            const expectedType = template.type;

            const storedOpenAiId = SessionStorage.getAssistantOpenAiIdForTab(tabId);
            const stored = assistants.find(
                (a) => a.openai_id === storedOpenAiId && a.type === expectedType,
            );
            if (!forceNew && stored) return stored;

            const matching = assistants.filter((a) => {
                if (expectedType === 'specialized') {
                    return a.module === module && a.type === 'specialized';
                }
                return a.type === expectedType;
            });

            if (!forceNew && matching.length > 0) {
                const existing = matching[0];
                SessionStorage.setAssistantOpenAiIdForTab(tabId, existing.openai_id);
                setAssistantOpenAiId(existing.openai_id);
                return existing;
            }

            // 🆕 Création d’un assistant via template
            const newOA = (await AssistantService.createAssistant(
                template.name,
            )) as OpenAiAssistant;

            const saved = await createAssistant({
                openai_id: newOA.id,
                ...template,
            });

            SessionStorage.setAssistantOpenAiIdForTab(tabId, saved.openai_id);
            SessionStorage.setAssistantCreatedForTab(tabId);
            if (forceNew) SessionStorage.clearForceNewAssistant(tabId);

            setAssistantOpenAiId(saved.openai_id);
            return saved;
        },
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
                    console.warn('⚠️ Erreur suppression du thread:', err);
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
