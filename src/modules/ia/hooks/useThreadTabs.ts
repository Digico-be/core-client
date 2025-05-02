'use client';

import { useEffect, useState } from 'react';

import { ThreadService } from '../services/OpenAi/threadService';
import { createThread as laravelCreateThread } from '../services/thread';

const STORAGE_KEY = (tabId: string) => `threads_by_assistant_tab_${tabId}`;

export const useThreadTabs = (
    tabId: string,
    assistantId?: string,
    module?: string
) => {
    const [threads, setThreads] = useState<string[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

    // Chargement initial depuis sessionStorage
    useEffect(() => {
        const raw = sessionStorage.getItem(STORAGE_KEY(tabId));
        if (raw) {
            const { threads: savedThreads, activeThreadId: savedActive } = JSON.parse(raw) as {
                threads: string[];
                activeThreadId: string | null;
            };
            setThreads(savedThreads);
            setActiveThreadId(savedActive);
        }
    }, [tabId]);

    // Persistance à chaque changement
    useEffect(() => {
        sessionStorage.setItem(
            STORAGE_KEY(tabId),
            JSON.stringify({ threads, activeThreadId })
        );
    }, [threads, activeThreadId, tabId]);

    /**
     * Crée un nouveau thread OpenAI + Laravel, puis l'ajoute en local
     */
    const addThread = async () => {
        if (!assistantId) {
            console.warn('Impossible de créer un thread sans assistantId');
            return;
        }

        // 1) Création OpenAI
        const openAIThread = await ThreadService.createThread(assistantId, module);

        // 2) Sauvegarde Laravel
        const saved = await laravelCreateThread(
            openAIThread.id,
            assistantId,
            module
        );

        // 3) Mise à jour locale
        setThreads((prev) => [...prev, saved.id]);
        setActiveThreadId(saved.id);
    };

    /**
     * Supprime un thread du state local
     */
    const removeThread = (threadId: string) => {
        // 1) On retire de la liste
        setThreads((prev) => prev.filter((t) => t !== threadId));

        // 2) Si c'était le thread actif, on bascule sur le premier restant (ou null)
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
    };
};
