'use client';

import React from 'react';

import AssistantTabs from './AssistantTabs';

interface AssistantTabsManagerProps {
    type: 'general' | 'specialized';
}

const AssistantTabsManager: React.FC<AssistantTabsManagerProps> = ({ type }) => {
    return (
        <div className="flex flex-col flex-1 w-full overflow-hidden">
            <h1 className="text-3xl font-bold pb-6">
                {type === 'general' ? 'Assistants Généraux' : 'Assistants Spécialisés'}
            </h1>
            <AssistantTabs type={type} />
        </div>
    );
};

export default AssistantTabsManager;
