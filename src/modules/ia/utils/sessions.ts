const SESSION_KEYS = {
    ASSISTANTS: 'assistant_ids_by_tab',
    THREADS: 'threads_by_tab',
    ASSISTANT_TABS: 'assistant_tabs',
    ACTIVE_TAB_ID: 'active_tab_id',
};

export const SessionStorage = {
    // ASSISTANT PAR ONGLET
    removeAssistantIdForTab(tabId: string) {
        sessionStorage.removeItem(`assistant_id_${tabId}`);
    },
    setAssistantIdForTab: (tabId: string, assistantId: string) => {
        const mapping = SessionStorage.getAssistantMapping();
        mapping[tabId] = assistantId;
        sessionStorage.setItem(SESSION_KEYS.ASSISTANTS, JSON.stringify(mapping));
    },

    getAssistantIdForTab: (tabId: string): string | null => {
        const mapping = SessionStorage.getAssistantMapping();
        return mapping[tabId] ?? null;
    },

    getAssistantMapping: (): Record<string, string> => {
        const raw = sessionStorage.getItem(SESSION_KEYS.ASSISTANTS);
        return raw ? JSON.parse(raw) : {};
    },

    // THREAD PAR ONGLET
    setThreadIdForTab: (tabId: string, threadId: string) => {
        const mapping = SessionStorage.getThreadMapping();
        mapping[tabId] = threadId;
        sessionStorage.setItem(SESSION_KEYS.THREADS, JSON.stringify(mapping));
    },

    getThreadIdForTab: (tabId: string): string | null => {
        const mapping = SessionStorage.getThreadMapping();
        return mapping[tabId] ?? null;
    },

    getThreadMapping: (): Record<string, string> => {
        const raw = sessionStorage.getItem(SESSION_KEYS.THREADS);
        return raw ? JSON.parse(raw) : {};
    },

    // ONGLET ACTIF
    setActiveTabId: (id: string) => sessionStorage.setItem(SESSION_KEYS.ACTIVE_TAB_ID, id),
    getActiveTabId: (): string | null => sessionStorage.getItem(SESSION_KEYS.ACTIVE_TAB_ID),

    // TABS
    saveTabs: (tabs: any[]) => sessionStorage.setItem(SESSION_KEYS.ASSISTANT_TABS, JSON.stringify(tabs)),
    getTabs: (): any[] => {
        const tabs = sessionStorage.getItem(SESSION_KEYS.ASSISTANT_TABS);
        return tabs ? JSON.parse(tabs) : [];
    },

    clear: () => {
        Object.values(SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));
    },
};
