import React from 'react';

import AssistantBase from './AssistantBase';

interface AssistantTabContentProps {
    tabId: string;
    module: string;
    type: 'general' | 'specialized';
}

const AssistantTabContent: React.FC<AssistantTabContentProps> = ({ tabId, module }) => {

    return (
        <AssistantBase tabId={tabId} module={module}/>
    );
};

export default AssistantTabContent;
