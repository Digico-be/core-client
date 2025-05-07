const SESSION_KEYS = {
    ASSISTANTS: 'assistant_openai_ids_by_tab',
    THREADS: 'threads_by_tab',
    ASSISTANT_TABS: 'assistant_tabs',
    ACTIVE_TAB_ID: 'active_tab_id',
    FORCE_NEW_ASSISTANT: 'force_new_assistant',

};

export const SessionStorage = {
    /* ─────── flag 'forceNew' pour un tab ─────── */
    setForceNewAssistant: (tabId: string) => {
        const raw = sessionStorage.getItem(SESSION_KEYS.FORCE_NEW_ASSISTANT) ?? '[]';
        const list: string[] = JSON.parse(raw);
        if (!list.includes(tabId)) list.push(tabId);
        sessionStorage.setItem(SESSION_KEYS.FORCE_NEW_ASSISTANT, JSON.stringify(list));
    },

    isForceNewAssistant: (tabId: string): boolean => {
        const raw = sessionStorage.getItem(SESSION_KEYS.FORCE_NEW_ASSISTANT) ?? '[]';
        return (JSON.parse(raw) as string[]).includes(tabId);
    },

    clearForceNewAssistant: (tabId: string) => {
        const raw = sessionStorage.getItem(SESSION_KEYS.FORCE_NEW_ASSISTANT) ?? '[]';
        const list: string[] = JSON.parse(raw).filter((id: string) => id !== tabId);
        sessionStorage.setItem(SESSION_KEYS.FORCE_NEW_ASSISTANT, JSON.stringify(list));
    },

    setAssistantCreatedForTab: (tabId: string) => {
        const key = `assistant_created_${tabId}`;
        sessionStorage.setItem(key, 'true');
    },

    isAssistantCreatedForTab: (tabId: string): boolean => {
        const key = `assistant_created_${tabId}`;
        return sessionStorage.getItem(key) === 'true';
    },

    clearAssistantCreatedFlag: (tabId: string) => {
        const key = `assistant_created_${tabId}`;
        sessionStorage.removeItem(key);
    },

    // ASSISTANT PAR ONGLET (stocke les openai_id par tab)
    removeAssistantOpenAiIdForTab(tabId: string) {
        const mapping = SessionStorage.getAssistantOpenAiIdMapping();
        delete mapping[tabId];
        sessionStorage.setItem(SESSION_KEYS.ASSISTANTS, JSON.stringify(mapping));
    },

    setAssistantOpenAiIdForTab: (tabId: string, openaiId: string) => {
        const mapping = SessionStorage.getAssistantOpenAiIdMapping();
        mapping[tabId] = openaiId;
        sessionStorage.setItem(SESSION_KEYS.ASSISTANTS, JSON.stringify(mapping));
    },

    getAssistantOpenAiIdForTab: (tabId: string): string | null => {
        const mapping = SessionStorage.getAssistantOpenAiIdMapping();
        return mapping[tabId] ?? null;
    },

    getAssistantOpenAiIdMapping: (): Record<string, string> => {
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

    removeThreadIdForTab: (tabId: string) => {
        const mapping = SessionStorage.getThreadMapping();
        delete mapping[tabId];
        sessionStorage.setItem(SESSION_KEYS.THREADS, JSON.stringify(mapping));
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

    // Tout effacer
    clear: () => {
        Object.values(SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key));
    },
};
