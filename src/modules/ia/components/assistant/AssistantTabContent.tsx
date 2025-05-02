'use client';

import React from 'react';

import { useAssistant } from '../../hooks/useAssistant';

import { ThreadSidebar } from '../thread/ThreadSidebar';

import AssistantBase from './AssistantBase';

interface AssistantTabContentProps {
    tabId: string;
    module: string;
    type: 'general' | 'specialized';
}

const AssistantTabContent: React.FC<AssistantTabContentProps> = ({ tabId, module }) => {
    const {
        data: assistant,
        isLoading,
        isError,
        error,
    } = useAssistant(module, tabId);

    if (isLoading) {
        return <div className="text-center p-4">Chargement de l’assistant...</div>;
    }

    if (isError || !assistant) {
        return (
            <div className="text-center p-4 text-red-500">
                {(error as Error)?.message ?? "Erreur lors du chargement de l'assistant"}
            </div>
        );
    }

    return (
        <div className="flex flex-row h-full min-h-0">
            {/* Sidebar de threads */}
            <div className="w-[300px] bg-gray-50">
                <ThreadSidebar tabId={tabId} assistantId={assistant.openai_id} module={module} />
            </div>

            {/* Zone principale (assistant + messages) */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <AssistantBase tabId={tabId} module={module} />
            </div>
        </div>
    );
};

export default AssistantTabContent;
