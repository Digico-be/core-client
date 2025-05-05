import { useEffect, useState } from 'react'

import { readAssistants } from '../services/assistant'

import { AssistantTab } from '../models/assistantTab'

export const useAssistantTabs = (type: 'general' | 'specialized') => {
    const [tabs, setTabs] = useState<AssistantTab[]>([])
    const [activeTabId, setActiveTabId] = useState<string | null>(null)

    useEffect(() => {
        const storedTabs = sessionStorage.getItem(`assistant_tabs_${type}`)
        const storedActive = sessionStorage.getItem(`active_assistant_tab_${type}`)
        if (storedTabs) setTabs(JSON.parse(storedTabs))
        if (storedActive) setActiveTabId(storedActive)
    }, [type])

    useEffect(() => {
        sessionStorage.setItem(`assistant_tabs_${type}`, JSON.stringify(tabs))
        sessionStorage.setItem(`active_assistant_tab_${type}`, activeTabId ?? '')
    }, [tabs, activeTabId, type])

    const initTabsFromAssistants = async () => {
        const assistants = await readAssistants({ module: type })
        const newTabs: AssistantTab[] = assistants.map(a => ({
            id: a.openai_id,
            title: a.name,
            module: a.module,
            type
        }))

        setTabs(newTabs)
        setActiveTabId(newTabs[0]?.id ?? null)
    }

    return {
        tabs,
        setTabs,
        activeTabId,
        setActiveTabId,
        initTabsFromAssistants
    }
}
