'use client';

import React, { useEffect } from 'react';
import { useAuth, useRouterWithTenant } from '@digico/utils'

import { useAssistant } from '../../hooks/useAssistant';
import { useChatThread } from '../../hooks/useChatThread';
import { useThreadTabsContext } from '../../hooks/useThreadTabsContext';

import { Assistant } from '../../models/assistant'
import { Message } from '../../models/message';
import { Thread } from '../../models/thread';
import MessageInput from '../message/MessageInput';

interface Props {
    module: string;
    tabId: string;
    type: string;
}

const AssistantBase: React.FC<Props> = ({ module, tabId, type }) => {
    const { data: assistant, isLoading, isError, error } = useAssistant(module, tabId, type);
    const { activeThreadId, threads, addThread, isLoading: threadsLoading } = useThreadTabsContext();
    const { tenant } = useAuth();
    const router = useRouterWithTenant()

    const {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        thread,
    } = useChatThread(
        tabId,
        assistant?.openai_id ?? '',
        module,
        tenant?.name ?? '',
        activeThreadId ?? undefined
    );

    useEffect(() => {
        if (!assistant?.openai_id || threadsLoading) return;
        if (threads.length === 0) {
            addThread();
        }
    }, [assistant?.openai_id, threads.length, threadsLoading, addThread]);

    if (isLoading) return <p className="p-4 text-center">Chargement…</p>;
    if (isError || !assistant)
        return (
            <p className="p-4 text-center text-red-500">
                {(error as Error)?.message ?? 'Erreur'}
            </p>
        );

    if (!activeThreadId || !thread)
        return <p className="p-4 text-center">Chargement du thread…</p>;

    const toSettings = (assistant: Assistant) => {
        router.push(`/ia/setting/${assistant.openai_id}`)
    }
    return (
        <div className="bg-white pt-4 flex flex-col flex-1 overflow-hidden">
            <h1 className="text-2xl font-bold text-center mb-4">{assistant.name}</h1>
            <p className="text-center mb-6 text-grey">{assistant.description}</p>

            <div className="flex justify-center mt-2 mb-6">
                <button onClick={() => toSettings(assistant)}>
                    Réglages
                </button>
            </div>

            <div className="text-xs text-center mb-6">
                AssistantId:&nbsp;{assistant.openai_id}
                <br />
                ThreadId:&nbsp;{thread?.id ?? 'Aucun'}
            </div>

            <MessageInput
                module={module}
                assistantId={assistant.openai_id}
                tabId={tabId}
                messages={messages as Message[]}
                streamedResponse={streamedResponse}
                sendMessage={sendMessage}
                deleteMessage={deleteMessage}
                editMessage={editMessage}
                thread={thread as Thread}
                compact={tabId === 'floating-window-general'}
            />
        </div>
    );
};

export default AssistantBase;
