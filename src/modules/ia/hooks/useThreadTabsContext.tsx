'use client'

import React, { createContext, useContext } from 'react'

import { useThreadTabs, UseThreadTabsReturn } from './useThreadTabs'

type ThreadTabsProviderProps =
    | { value: UseThreadTabsReturn; children: React.ReactNode }
    | { tabId: string; assistantId?: string; module?: string; children: React.ReactNode }

const ThreadTabsCtx = createContext<UseThreadTabsReturn | null>(null)

export function ThreadTabsProvider(props: ThreadTabsProviderProps) {
    const shouldUseHook = !('value' in props)

    // ⚠️ Toujours appeler le hook, même si on ne s’en sert pas
    const hookValue = useThreadTabs(
        shouldUseHook ? props.tabId : '',
        shouldUseHook ? props.assistantId : undefined,
        shouldUseHook ? props.module : undefined
    )

    const contextValue = shouldUseHook ? hookValue : props.value

    return (
        <ThreadTabsCtx.Provider value={contextValue}>
            {props.children}
        </ThreadTabsCtx.Provider>
    )
}

export function useThreadTabsContext(): UseThreadTabsReturn {
    const context = useContext(ThreadTabsCtx)
    if (!context) {
        throw new Error('useThreadTabsContext must be used inside a <ThreadTabsProvider>')
    }
    return context
}
