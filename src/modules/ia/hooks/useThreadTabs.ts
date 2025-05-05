import { useEffect, useRef, useState } from 'react';

import { ThreadService } from '../services/OpenAi/threadService';
import { createThread as laravelCreateThread } from '../services/thread';
import { listThreads } from '../services/thread';

const STORAGE_KEY = (tabId: string) => `threads_by_assistant_tab_${tabId}`;
const LOCK_KEY = (tabId: string) => `thread_creation_lock_${tabId}`;

export interface UseThreadTabsReturn {
    threads: string[];
    activeThreadId: string | null;
    setActiveThreadId: (id: string | null) => void;
    addThread: () => Promise<void>;
    removeThread: (threadId: string) => void;
    isLoading: boolean;
    hasFetchedFromDB: boolean;
}

export const useThreadTabs = (
    tabId: string,
    assistantId?: string,
    module?: string
): UseThreadTabsReturn => {
    const [threads, setThreads] = useState<string[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasFetchedFromDB, setHasFetchedFromDB] = useState(false);

    const hasAutoCreatedThread = useRef(false);

    // 🔁 Charger depuis sessionStorage ou DB
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            setHasFetchedFromDB(false);

            const raw = sessionStorage.getItem(STORAGE_KEY(tabId));
            if (raw) {
                const { threads: saved, activeThreadId: savedActive } = JSON.parse(raw);
                setThreads(saved);
                setActiveThreadId(savedActive);

                if (saved.length > 0) {
                    sessionStorage.removeItem(LOCK_KEY(tabId));
                    setHasFetchedFromDB(true);
                    setIsLoading(false);
                    return;
                }
            }

            if (assistantId) {
                try {
                    const found = await listThreads(assistantId, module);
                    const ids = found.map((t) => t.id);
                    setThreads(ids);
                    setActiveThreadId(ids[0] ?? null);

                    if (ids.length > 0) {
                        sessionStorage.removeItem(LOCK_KEY(tabId));
                    } else if (!hasAutoCreatedThread.current) {
                        hasAutoCreatedThread.current = true;
                        await addThreadInternal(assistantId, module);
                    }
                } catch (err) {
                    console.warn('[useThreadTabs] Échec listThreads:', err);
                }
            }

            setHasFetchedFromDB(true);
            setIsLoading(false);
        })();
    }, [tabId, assistantId, module]);

    // 🧠 Sauvegarder dans sessionStorage
    useEffect(() => {
        sessionStorage.setItem(
            STORAGE_KEY(tabId),
            JSON.stringify({ threads, activeThreadId })
        );
    }, [threads, activeThreadId, tabId]);

    // 👷 Fonction interne de création
    const addThreadInternal = async (id: string, mod?: string) => {
        const isLocked = sessionStorage.getItem(LOCK_KEY(tabId));
        if (isLocked === 'true') {
            return;
        }

        sessionStorage.setItem(LOCK_KEY(tabId), 'true');

        try {
            const open = await ThreadService.createThread(id, mod);
            const saved = await laravelCreateThread(open.id, id, mod);
            const threadId = saved.id ?? open.id;

            setThreads((prev) => [...prev, threadId]);
            setActiveThreadId(threadId);
        } catch (error) {
            console.error('[useThreadTabs] Erreur création thread', error);
            sessionStorage.removeItem(LOCK_KEY(tabId));
        }
    };

    const addThread = async () => {
        if (!assistantId || !hasFetchedFromDB) {
            console.warn('[useThreadTabs] Pas prêt pour création');
            return;
        }

        await addThreadInternal(assistantId, module);
    };

    const removeThread = async (threadId: string) => {

        try {
            await ThreadService.deleteThread(threadId);
        } catch (err) {
            console.error('[useThreadTabs] Échec suppression', err);
        }

        setThreads((prev) => prev.filter((t) => t !== threadId));
        if (threadId === activeThreadId) {
            const remaining = threads.filter((t) => t !== threadId);
            setActiveThreadId(remaining[0] ?? null);
        }
    };

    return {
        threads,
        activeThreadId,
        setActiveThreadId,
        addThread,
        removeThread,
        isLoading,
        hasFetchedFromDB,
    };
};
