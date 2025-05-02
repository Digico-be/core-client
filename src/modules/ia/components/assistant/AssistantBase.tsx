'use client';

import React from 'react';
import { useAuth } from '@digico/utils';

import { useAssistant } from '../../hooks/useAssistant';
import { useChatThread } from '../../hooks/useChatThread';
import { useThreadTabsContext } from '../../hooks/useThreadTabsContext'

import { Message } from '../../models/message';
import { Thread } from '../../models/thread';
import MessageInput from '../message/MessageInput';

interface Props {
    module: string;
    tabId: string;
}

const AssistantBase: React.FC<Props> = ({ module, tabId }) => {
    /** 1) Chargement / création de l’assistant */
    const {
        data: assistant,
        isLoading,
        isError,
        error,
    } = useAssistant(module, tabId);

    /** 2) Thread actif depuis le contexte */
    const { activeThreadId } = useThreadTabsContext();

    /** 3) Hook chat */
    const { tenant } = useAuth();
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

    /* ---------- Rendu ---------- */
    if (isLoading) return <p className="p-4 text-center">Chargement…</p>;
    if (isError || !assistant)
        return (
            <p className="p-4 text-center text-red-500">
                {(error as Error)?.message ?? 'Erreur'}
            </p>
        );

    return (
        <div className="bg-white pt-4 flex flex-col flex-1 overflow-hidden">
            <h1 className="text-2xl font-bold text-center mb-4">{assistant.name}</h1>
            <p className="text-center mb-6 text-grey">{assistant.description}</p>

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
                thread={thread as Thread | null}
            />
        </div>
    );
};

export default AssistantBase;
