'use client';

import { usePathname } from 'next/navigation';

import React, { useState } from 'react';

import { useAssistant } from '../../hooks/useAssistant';
import { ThreadTabsProvider } from '../../hooks/useThreadTabsContext';

import AssistantBase from '../assistant/AssistantBase';

const AssistantWindow: React.FC = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const moduleType = 'specialized';
    const tabId = 'floating-window-general';
    const excludedPaths = ['/codevo', '/codevo/ia'];

    // 👉 On récupère l’assistant ICI
    const { data: assistant } = useAssistant(moduleType, tabId, 'general');

    if (excludedPaths.includes(pathname)) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50"
            >
                {isOpen ? 'Fermer Assistant' : '💬 Assistant'}
            </button>

            {isOpen && assistant && (
                <div className="fixed bottom-20 right-6 w-[400px] h-[600px] bg-white border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col px-2">
                    <ThreadTabsProvider
                        tabId={tabId}
                        module={moduleType}
                        assistantId={assistant.openai_id}
                    >
                        <AssistantBase tabId={tabId} module={moduleType} type={'specialized'}/>
                    </ThreadTabsProvider>
                </div>
            )}
        </>
    );
};

export default AssistantWindow;
