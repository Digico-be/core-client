'use client';

import { useEffect, useState } from 'react';

import { ThreadService } from '../services/OpenAi/threadService';
import { createThread as laravelCreateThread } from '../services/thread';
import { listThreads } from '../services/thread/list-threads';

/* ---------- Constantes ---------- */
const STORAGE_KEY = (tabId: string) => `threads_by_assistant_tab_${tabId}`;

/* ---------- Typage exporté pour le contexte ---------- */
export interface UseThreadTabsReturn {
    threads: string[];
    activeThreadId: string | null;
    setActiveThreadId: (id: string | null) => void;
    addThread: () => Promise<void>;
    removeThread: (threadId: string) => void;
}

/* -------------------------------------------------------------------------- */
/*                                    Hook                                    */
/* -------------------------------------------------------------------------- */
export const useThreadTabs = (
    tabId: string,
    assistantId?: string,
    module?: string
): UseThreadTabsReturn => {
    const [threads, setThreads] = useState<string[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

    /* ---------- Chargement initial (sessionStorage puis DB) ---------- */
    useEffect(() => {
        (async () => {
            /* 1️⃣ SessionStorage -------------------------------------- */
            const raw = sessionStorage.getItem(STORAGE_KEY(tabId));
            if (raw) {
                const { threads: saved, activeThreadId: savedActive } = JSON.parse(raw);
                setThreads(saved);
                setActiveThreadId(savedActive);
                if (saved.length) return; // → si on a déjà des threads, on s’arrête là
            }

            /* 2️⃣Fallback DB(Laravel) ------------------------------- */
            if (assistantId) {
                try {
                    const found = await listThreads(assistantId, module);
                    const ids = found.map((t) => t.id);
                    setThreads(ids);
                    setActiveThreadId(ids[0] ?? null);
                    console.debug('[useThreadTabs] threads chargés depuis DB:', ids);
                } catch (err) {
                    console.warn('[useThreadTabs] échec listThreads:', err);
                }
            }
        })();
    }, [tabId, assistantId, module]);

    /* ---------- Persistance dans sessionStorage ---------- */
    useEffect(() => {
        sessionStorage.setItem(
            STORAGE_KEY(tabId),
            JSON.stringify({ threads, activeThreadId })
        );
    }, [threads, activeThreadId, tabId]);

    /* ---------- Actions ---------- */
    const addThread = async () => {
        if (!assistantId) {
            console.warn('[useThreadTabs] assistantId manquant');
            return;
        }

        /* 1. Création OpenAI */
        const open = await ThreadService.createThread(assistantId, module);

        /* 2. Sauvegarde Laravel */
        const saved = await laravelCreateThread(open.id, assistantId, module);

        /* 3. Choix de l’ID (fallback open.id si saved.id indéfini) */
        const threadId = saved.id ?? open.id;
        console.debug('[addThread] openId :', open.id, 'laravelId :', saved.id);

        setThreads((prev) => [...prev, threadId]);
        setActiveThreadId(threadId);
    };

    const removeThread = async (threadId: string) => {
        console.log('[useThreadTabs] ⇢ suppression thread', threadId);

        try {
            await ThreadService.deleteThread(threadId); // appelle la route Next.js
            console.log('[useThreadTabs] ✓ supprimé côté serveur');
        } catch (err) {
            console.error('[useThreadTabs] ✗ échec suppression', err);
        }

        /* Mise à jour UI ------------------------------ */
        setThreads((prev) => prev.filter((t) => t !== threadId));
        if (threadId === activeThreadId) {
            const remaining = threads.filter((t) => t !== threadId);
            setActiveThreadId(remaining[0] ?? null);
        }
    };

    /* ---------- Retour ---------- */
    return {
        threads,
        activeThreadId,
        setActiveThreadId,
        addThread,
        removeThread,
    };
};
