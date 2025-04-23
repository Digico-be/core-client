import { useEffect, useState } from 'react'

import { AssistantTab } from '../models/assistantTab'

export const useAssistantTabs = (type: 'general' | 'specialized') => {
    const [tabs, setTabs] = useState<AssistantTab[]>([])
    const [activeTabId, setActiveTabId] = useState<string | null>(null)

    // Charger les tabs depuis la session
    useEffect(() => {
        const storedTabs = sessionStorage.getItem(`assistant_tabs_${type}`)
        const storedActive = sessionStorage.getItem(`active_assistant_tab_${type}`)
        if (storedTabs) setTabs(JSON.parse(storedTabs))
        if (storedActive) setActiveTabId(storedActive)
    }, [type])

    // Sauvegarder les tabs
    useEffect(() => {
        sessionStorage.setItem(`assistant_tabs_${type}`, JSON.stringify(tabs))
        sessionStorage.setItem(`active_assistant_tab_${type}`, activeTabId ?? '')
    }, [tabs, activeTabId, type])

    return {
        tabs,
        setTabs,
        activeTabId,
        setActiveTabId,
    }
}
