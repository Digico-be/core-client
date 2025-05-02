'use client';

import React, { useState } from 'react';
import { useAuth } from '@digico/utils';

import { useAssistant } from '../../hooks/useAssistant';
import { useChatThread } from '../../hooks/useChatThread';

import { Message } from '../../models/message';
import { ModuleType } from '../../models/module'
import { Thread } from '../../models/thread';
import MessageInput from '../message/MessageInput';

interface AssistantBaseProps {
    module: string;
    tabId: string;
}

const AssistantBase: React.FC<AssistantBaseProps> = ({ module, tabId }) => {
    /** 1) Chargement ou création de l’assistant */
    const {
        data: assistant,
        isLoading,
        isSuccess,
        isError,
        error,
    } = useAssistant(module, tabId);
    /** 2) Gestion du thread & des messages (dépend de l’assistant) */
    const { tenant } = useAuth();
    const {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        thread,
    } = useChatThread(tabId, assistant?.openai_id ?? '', module, tenant?.name ?? '');

    const [isDeleted] = useState(false);

    /** Rendu */
    return (
        <div className="bg-white pt-4 flex flex-col flex-1 overflow-hidden">
            {isLoading ? (
                <p className="text-center text-grey">Chargement de l’assistant…</p>
            ) : isError ? (
                <p className="text-center text-red">
                    {(error as Error)?.message ?? 'Erreur lors du chargement'}
                </p>
            ) : isDeleted ? (
                <p className="text-center text-gray">Assistant supprimé</p>
            ) : isSuccess && assistant ? (
                <>
                    <h1 className="text-2xl font-bold text-center mb-4">{assistant.name}</h1>
                    <p className="text-center mb-6 text-grey">{assistant.description}</p>
                    {/* Affichage de l'ID et du thread
                    <div className="text-xs text-center mb-6">
                        AssistantId:&nbsp;{assistant.openai_id}
                        <br />
                        ThreadId:&nbsp;{thread?.id ?? 'Aucun thread'}
                    </div>
                       */}
                    {/* Zone de chat */}
                    <MessageInput
                        module={module}
                        assistantId={assistant.openai_id}
                        tabId={tabId}
                        /** nouveaux props provenant du hook */
                        messages={messages as Message[]}
                        streamedResponse={streamedResponse}
                        sendMessage={sendMessage}
                        deleteMessage={deleteMessage}
                        editMessage={editMessage}
                        thread={thread as Thread | null}
                    />
                </>
            ) : (
                <p className="text-center text-grey">Aucun assistant trouvé</p>
            )}
        </div>
    );
};

export default AssistantBase;
