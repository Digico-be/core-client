import React from 'react';

import { ThreadSidebar } from '../thread/ThreadSidebar';

import AssistantBase from './AssistantBase';

interface AssistantTabContentProps {
    tabId: string;
    module: string;
    type: 'general' | 'specialized';
}

const AssistantTabContent: React.FC<AssistantTabContentProps> = ({ tabId, module }) => {
    return (
        <div className="flex flex-row h-full min-h-0">
            {/* Sidebar de threads */}
            <div className="w-[300px] bg-gray-50">
                <ThreadSidebar tabId={tabId} />
            </div>

            {/* Zone principale (assistant + messages) */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <AssistantBase tabId={tabId} module={module} />
            </div>
        </div>
    );
};

export default AssistantTabContent;
