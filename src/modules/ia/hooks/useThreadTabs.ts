import { useCallback, useEffect, useRef, useState } from 'react'

import { ThreadService } from '../services/OpenAi/threadService'
import { createThread as laravelCreateThread, listThreads } from '../services/thread'

const STORAGE_KEY = (tabId: string) => `threads_by_assistant_tab_${tabId}`
const LOCK_KEY = (tabId: string) => `thread_creation_lock_${tabId}`

export interface UseThreadTabsReturn {
    threads: string[]
    activeThreadId: string | null
    setActiveThreadId: (id: string | null) => void
    addThread: () => Promise<void>
    removeThread: (threadId: string) => void
    isLoading: boolean
    hasFetchedFromDB: boolean
}

export const useThreadTabs = (
    tabId: string,
    assistantId?: string,
    module?: string
): UseThreadTabsReturn => {
    const [threads, setThreads] = useState<string[]>([])
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [hasFetchedFromDB, setHasFetchedFromDB] = useState(false)

    const hasAutoCreatedThread = useRef(false)

    /* création interne */
    const addThreadInternal = useCallback(
        async (id: string, mod?: string) => {
            if (sessionStorage.getItem(LOCK_KEY(tabId)) === 'true') return
            sessionStorage.setItem(LOCK_KEY(tabId), 'true')

            try {
                const open = await ThreadService.createThread(id, mod)
                const saved = await laravelCreateThread(open.id, id, mod)
                const threadId = saved.id ?? open.id
                setThreads(prev => [...prev, threadId])
                setActiveThreadId(threadId)
            } catch (err) {
                console.error('[useThreadTabs] Erreur création thread :', err)
                sessionStorage.removeItem(LOCK_KEY(tabId))
            }
        },
        [tabId]
    )

    /* chargement initial */
    const loadThreads = useCallback(async () => {
        setIsLoading(true)
        setHasFetchedFromDB(false)

        const stored = sessionStorage.getItem(STORAGE_KEY(tabId))
        if (stored) {
            try {
                const { threads: saved, activeThreadId: savedActive } = JSON.parse(stored)
                if (saved?.length > 0) {
                    setThreads(saved)
                    setActiveThreadId(savedActive)
                    sessionStorage.removeItem(LOCK_KEY(tabId))
                    setHasFetchedFromDB(true)
                    setIsLoading(false)
                    return
                }
            } catch {
                /* JSON invalide : on ignore et on repart proprement */
            }
        }

        if (!assistantId) {
            setIsLoading(false)
            return
        }

        try {
            const found = await listThreads(assistantId, module)
            const ids = found.map(t => t.id)
            setThreads(ids)
            setActiveThreadId(ids[0] ?? null)

            if (ids.length === 0 && !hasAutoCreatedThread.current) {
                hasAutoCreatedThread.current = true
                await addThreadInternal(assistantId, module)
            } else {
                sessionStorage.removeItem(LOCK_KEY(tabId))
            }
        } catch {
            /* Récupération échouée: non bloquant, on continue */
        }

        setHasFetchedFromDB(true)
        setIsLoading(false)
    }, [tabId, assistantId, module, addThreadInternal])

    useEffect(() => {
        loadThreads()
    }, [loadThreads])

    /* persistance storage */
    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY(tabId), JSON.stringify({ threads, activeThreadId }))
    }, [threads, activeThreadId, tabId])

    /* API */
    const addThread = useCallback(async () => {
        if (!assistantId || !hasFetchedFromDB) return
        await addThreadInternal(assistantId, module)
    }, [assistantId, module, hasFetchedFromDB, addThreadInternal])

    const removeThread = useCallback(
        async (threadId: string) => {
            try {
                await ThreadService.deleteThread(threadId)
            } catch (err) {
                console.error('[useThreadTabs] Erreur suppression thread :', err)
            }

            setThreads(prev => prev.filter(t => t !== threadId))

            if (threadId === activeThreadId) {
                const remaining = threads.filter(t => t !== threadId)
                setActiveThreadId(remaining[0] ?? null)
            }
        },
        [activeThreadId, threads]
    )

    return {
        threads,
        activeThreadId,
        setActiveThreadId,
        addThread,
        removeThread,
        isLoading,
        hasFetchedFromDB
    }
}
