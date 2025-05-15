'use client';

import { usePathname } from 'next/navigation';

import React, { useState } from 'react';

import { useAssistant } from '../../hooks/useAssistant';
import { ThreadTabsProvider } from '../../hooks/useThreadTabsContext';

import { assistantTemplates } from '../../config/assistantTemplates';
import AssistantBase from '../assistant/AssistantBase';

const AssistantWindow: React.FC = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const parts = pathname?.split('/') || [];
    const moduleFromPath = parts[2] || ''; // /tenant/<module>/...

    const excludedPaths = ['/codevo', '/codevo/ia'];
    const isExcluded = excludedPaths.includes(pathname);

    const isRadar = moduleFromPath === 'radar';
    const isSpecializedModule = Object.keys(assistantTemplates.specialized.modules ?? {}).includes(moduleFromPath);
    const isValid = !isExcluded && (isRadar || isSpecializedModule);

    const type = isRadar ? 'radar' : 'specialized';
    const tabId = `floating-window-${moduleFromPath}`;
    const moduleName = moduleFromPath;

    const { data: assistant } = useAssistant(moduleName, tabId, type);

    if (!isValid) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50"
            >
                {isOpen ? 'Fermer Assistant' : '💬 Assistant'}
            </button>

            {isOpen && assistant && (
                <div className="border-main/10 fixed bottom-20 right-6 w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] bg-white border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col px-2">
                    <ThreadTabsProvider
                        tabId={tabId}
                        module={moduleName}
                        assistantId={assistant.openai_id}
                    >
                        <AssistantBase tabId={tabId} module={moduleName} type={type} />
                    </ThreadTabsProvider>
                </div>
            )}
        </>
    );
};

export default AssistantWindow;
