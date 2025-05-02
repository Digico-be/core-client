'use client';

import React, { createContext, useContext } from 'react';

import { useThreadTabs, UseThreadTabsReturn } from './useThreadTabs';

/* ---------- Types ---------- */
type Props =
    | { value: UseThreadTabsReturn; children: React.ReactNode }
    | { children: React.ReactNode; tabId: string; assistantId?: string; module?: string };

/* ---------- Contexte ---------- */
const ThreadTabsCtx = createContext<UseThreadTabsReturn | null>(null);

export function ThreadTabsProvider(props: Props) {
    /* Cas où un value est fourni (tests, preview…) */
    if ('value' in props) {
        return (
            <ThreadTabsCtx.Provider value={props.value}>
                {props.children}
            </ThreadTabsCtx.Provider>
        );
    }

    /* Cas normal */
    const { tabId, assistantId, module, children } = props;
    /* eslint-disable react-hooks/rules-of-hooks */
    const value = useThreadTabs(tabId, assistantId, module);
    /* eslint-enable react-hooks/rules-of-hooks */

    return <ThreadTabsCtx.Provider value={value}>{children}</ThreadTabsCtx.Provider>;
}

/* ---------- Hook pratique ---------- */
export function useThreadTabsContext() {
    const ctx = useContext(ThreadTabsCtx);
    if (!ctx) {
        throw new Error('useThreadTabsContext must be used inside a <ThreadTabsProvider>');
    }
    return ctx;
}
