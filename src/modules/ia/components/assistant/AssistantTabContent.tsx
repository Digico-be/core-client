'use client';

import React, { useEffect, useState } from 'react';

import { useAssistant } from '../../hooks/useAssistant';
import { useThreadTabs } from '../../hooks/useThreadTabs';
import { ThreadTabsProvider } from '../../hooks/useThreadTabsContext';

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
        isLoading: assistantLoading,
        isError,
        error,
    } = useAssistant(module, tabId);

    const threadTabs = useThreadTabs(tabId, assistant?.openai_id, module);
    const { threads, addThread, isLoading: threadsLoading, hasFetchedFromDB } = threadTabs;

    const [threadReady, setThreadReady] = useState(false);

    useEffect(() => {
        console.debug('[useThreadTabs] threads.length:', threads.length);

        // On attend assistant + hasFetchedFromDB + threads non null
        if (!assistant || threadsLoading || !hasFetchedFromDB) return;

        // Evite double appel si déjà prêt
        if (threadReady) return;

        // 🔒 Sécurité : si threads !== undefined mais vide
        if (threads.length === 0) {
            console.debug('[AssistantTabContent] Aucun thread, création…');
            addThread().then(() => setThreadReady(true));
        } else {
            console.debug('[AssistantTabContent] Thread déjà existant');
            setThreadReady(true);
        }
    }, [assistant, threads.length, threadsLoading, hasFetchedFromDB, threadReady, addThread]);

    // ✅ Ne pas afficher tant que tout n’est pas prêt
    if (assistantLoading || threadsLoading || !threadReady) {
        return <p className="p-4 text-center">Chargement…</p>;
    }

    if (isError || !assistant) {
        return (
            <p className="p-4 text-center text-red-500">
                {(error as Error)?.message ?? 'Erreur de chargement'}
            </p>
        );
    }

    return (
        <ThreadTabsProvider value={threadTabs}>
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
