'use client';

import React from 'react';

import { useAssistant } from '../../hooks/useAssistant';
import { ThreadTabsProvider } from '../../hooks/useThreadTabsContext'

import { ThreadSidebar } from '../thread/ThreadSidebar';

import AssistantBase from './AssistantBase';

interface Props {
    tabId: string;
    module: string;
    type: 'general' | 'specialized';
}

const AssistantTabContent: React.FC<Props> = ({ tabId, module }) => {
    const {
        data: assistant,
        isLoading,
        isError,
        error,
    } = useAssistant(module, tabId);

    if (isLoading) return <p className="p-4 text-center">Chargement…</p>;
    if (isError || !assistant)
        return (
            <p className="p-4 text-center text-red-500">
                {(error as Error)?.message ?? 'Erreur de chargement'}
            </p>
        );

    return (
        <ThreadTabsProvider
            tabId={tabId}
            assistantId={assistant.openai_id}
            module={module}
        >
            <div className="flex flex-row h-full min-h-0">
                <div className="w-[300px] bg-gray-50">
                    <ThreadSidebar />
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <AssistantBase module={module} tabId={tabId} />
                </div>
            </div>
        </ThreadTabsProvider>
    );
};

export default AssistantTabContent;
