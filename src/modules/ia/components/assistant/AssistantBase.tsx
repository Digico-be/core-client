import React, { useState } from 'react';

import { useAssistant } from '../../hooks/useAssistant';

import MessageInput from '../message/MessageInput';

const AssistantBase: React.FC<{ module: string; tabId: string }> = ({ module, tabId }) => {
    const {
        data: assistant,
        isLoading,
        isError,
        error,
        isDeleting,
    } = useAssistant(module, tabId);

    const [isDeleted] = useState(false);

    return (
        <div className="bg-white pt-4">
            {isLoading || isDeleting ? (
                <p className="text-center text-grey">Chargement de l’assistant...</p>
            ) : isError ? (
                <p className="text-center text-red">
                    {(error as Error)?.message ?? "Erreur lors du chargement"}
                </p>
            ) : isDeleted ? (
                <p className="text-center text-gray">Assistant supprimé</p>
            ) : assistant ? (
                <>
                    <h1 className="text-2xl font-bold text-center mb-4">{assistant.name}</h1>
                    <p className="text-center mb-6 text-grey">{assistant.description}</p>

                    <MessageInput module={module} assistantId={assistant.openai_id} tabId={tabId} />
                </>
            ) : (
                <p className="text-center text-grey">Aucun assistant trouvé</p>
            )}
        </div>
    );
};

export default AssistantBase;
