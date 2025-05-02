// hooks/useThreadTabs.ts
import { useEffect, useState } from 'react'

const STORAGE_KEY = (tabId: string) => `threads_by_assistant_tab_${tabId}`

export const useThreadTabs = (tabId: string) => {
    const [threads, setThreads] = useState<string[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)

    useEffect(() => {
        const stored = sessionStorage.getItem(STORAGE_KEY(tabId))
        if (stored) {
            const parsed = JSON.parse(stored)
            setThreads(parsed.threads)
            setActiveThreadId(parsed.activeThreadId)
        }
    }, [tabId])

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY(tabId), JSON.stringify({ threads, activeThreadId }))
    }, [threads, activeThreadId, tabId])

    const addThread = (id: string) => {
        setThreads((prev) => [...prev, id])
        setActiveThreadId(id)
    }

    const removeThread = (id: string) => {
        const remaining = threads.filter((t) => t !== id)
        setThreads(remaining)
        if (id === activeThreadId) setActiveThreadId(remaining[0] ?? null)
    }

    return {
        threads,
        activeThreadId,
        setActiveThreadId,
        addThread,
        removeThread,
    }
}
