'use client';

import React from 'react';

import AssistantTabs from './AssistantTabs';

interface AssistantTabsManagerProps {
    type: 'general' | 'specialized';
}

const AssistantTabsManager: React.FC<AssistantTabsManagerProps> = ({ type }) => {
    return (
        <div className="flex flex-col flex-1 w-full overflow-hidden">
            <AssistantTabs type={type} />
        </div>
    );
};

export default AssistantTabsManager;
