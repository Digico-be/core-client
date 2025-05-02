'use client'

import AssistantTabsManager from '../../../modules/ia/components/assistant/AssistantTabsManager'

export default function Index() {
    return (
        <div className="flex flex-col h-full">
            <AssistantTabsManager type="general" />
        </div>
    )
}
