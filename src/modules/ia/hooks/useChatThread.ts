'use client';

import { useEffect, useRef, useState } from 'react';

import { createFileMessage } from '../services/file_message';
import { RunService } from '../services/OpenAi/runService';
import { StreamService } from '../services/OpenAi/streamService';
import { ThreadService } from '../services/OpenAi/threadService';
import { destroyThread } from '../services/thread';

import { IAFile } from '../models/file';
import { Message } from '../models/message';
import { Thread, ThreadMessageContent } from '../models/thread';
import { SessionStorage } from '../utils/sessions';

import { useThreadMessages } from './useThreadMessages';

export const useChatThread = (
    tabId: string,
    assistantId: string,
    module: string,
    workspaceSlug: string,
    initialThreadId?: string
) => {
    /* ---------- 1. État principal ---------- */
    const [thread, setThread] = useState<Thread | null>(null);
    const [streamedResponse, setStreamedResponse] = useState('');

    /* ---------- 2. Messages ---------- */
    const {
        messages,
        setMessages,
        loadMessages,
        deleteMessage,
        editMessage,
    } = useThreadMessages();

    /* ---------- 3. Init idempotent ---------- */
    const didInitRef = useRef(false);

    /** Initialise le thread local (une seule fois par ID) */
    useEffect(() => {
        if (didInitRef.current || !initialThreadId) return;

        const local: Thread = {
            id: initialThreadId,
            assistantId,
            module,
            createdAt: new Date().toISOString(),
        };
        setThread(local);
        SessionStorage.setThreadIdForTab(tabId, local.id);

        loadMessages(local.id).catch(console.error);

        didInitRef.current = true;
    }, [initialThreadId, assistantId, module, tabId, loadMessages]);

    /* ---------- 4bis. Plus aucun thread actif (liste vide) ---------- */
    useEffect(() => {
        // Si le thread actuel vient d’être supprimé et qu’il n’y a plus d’ID actif,
        // on nettoie l’état local pour ne plus afficher l’ancienne conversation.
        if (thread && !initialThreadId) {
            console.log('[useChatThread] reset – plus de thread actif');
            setThread(null);
            setMessages([]);
            didInitRef.current = false;
        }
    }, [initialThreadId, thread, setMessages]);


    /* ---------- 5. Suppression thread ---------- */
    const removeThread = async (threadId: string) => {
        try {
            await ThreadService.deleteThread(threadId);
            await destroyThread(threadId);
        } catch (e) {
            console.error('Erreur suppression thread', e);
        }
        SessionStorage.removeThreadIdForTab(tabId);
        setThread(null);
        didInitRef.current = false;
    };

    /* ---------- 6. Envoi de message ---------- */
    const sendMessage = async (
        input: string | ThreadMessageContent[],
        attachments?: IAFile[],
        options: { skipUserMessage?: boolean } = {}
    ) => {
        if (!thread?.id) return;

        setStreamedResponse('');

        const content: ThreadMessageContent[] =
            typeof input === 'string' ? [{ type: 'text', text: input }] : input;

        const hasFile = !!attachments?.length;
        const attachmentIds = attachments?.map((f) => f.id) || [];

        /* 6.1 Envoi user */
        const userRes = await ThreadService.sendMessageToThread(
            thread.id,
            content,
            'user',
            attachmentIds
        );

        const userMsg: Message = {
            id: userRes.id,
            sender: 'user',
            content: content.find((c) => c.type === 'text')?.text || '',
            timestamp: new Date(userRes.created_at * 1000).toISOString(),
            threadId: thread.id,
            attachments: hasFile
                ? attachments!.map((f) => ({
                    openai_id: f.id,
                    filename: f.filename,
                    size: f.size ?? 0,
                    mime_type: f.mimeType ?? 'application/octet-stream',
                }))
                : undefined,
        };
        if (!options.skipUserMessage) setMessages((p) => [...p, userMsg]);

        /* 6.2 Liaison fichiers */
        if (hasFile) {
            for (const f of attachments!) {
                await createFileMessage({
                    file_openai_id: f.id,
                    message_openai_id: userRes.id,
                    thread_openai_id: thread.id,
                });
            }
        }

        /* 6.3 Message thinking */
        setMessages((p) => [
            ...p,
            {
                id: 'thinking',
                sender: 'assistant',
                content: '🤖 L’assistant réfléchit...',
                timestamp: new Date().toISOString(),
                threadId: thread.id,
            },
        ]);

        /* 6.4 Réponse */
        if (!hasFile) {
            /* ---- Streaming texte ---- */
            let first = true;
            const full = await StreamService.startStreamingResponse(
                content.find((c) => c.type === 'text')?.text || '',
                (tok) => {
                    setStreamedResponse((prev) => prev + tok);
                    if (first) {
                        first = false;
                        setTimeout(() => {
                            setMessages((p) => p.filter((m) => m.id !== 'thinking'));
                        }, 0);
                    }
                },
                workspaceSlug,
                () => {}
            );

            if (full.trim()) {
                const aRes = await ThreadService.sendMessageToThread(
                    thread.id,
                    [{ type: 'text', text: full }],
                    'assistant'
                );
                setMessages((p) => [
                    ...p,
                    {
                        id: aRes.id,
                        sender: 'assistant',
                        content: full,
                        timestamp: new Date(aRes.created_at * 1000).toISOString(),
                        threadId: thread.id,
                    },
                ]);
            } else {
                setMessages((p) => p.filter((m) => m.id !== 'thinking'));
            }
            setStreamedResponse('');
        } else {
            /* ---- Run + fichiers ---- */
            try {
                const run = await RunService.startRun(thread.id, assistantId);
                const intv = setInterval(async () => {
                    const status = await RunService.getStatus(thread.id, run.id);
                    if (status.status === 'completed') {
                        clearInterval(intv);
                        const all = await ThreadService.getMessagesFromThread(thread.id);
                        const msg = all.find((m) => m.role === 'assistant');
                        if (msg) {
                            setMessages((prev) => [
                                ...prev.filter((m) => m.id !== 'thinking'),
                                {
                                    id: msg.id,
                                    sender: 'assistant',
                                    content: msg.content[0]?.text?.value || '',
                                    timestamp: new Date(msg.created_at * 1000).toISOString(),
                                    threadId: thread.id,
                                },
                            ]);
                        }
                    } else if (status.status === 'failed') {
                        clearInterval(intv);
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === 'thinking'
                                    ? {
                                        ...m,
                                        content: '❌ Erreur lors du traitement du fichier.',
                                    }
                                    : m
                            )
                        );
                    }
                }, 2000);
            } catch (e) {
                console.error('Run assistant', e);
            }
        }
    };

    /* ---------- 7. Retour hook ---------- */
    return {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        removeThread,
        thread,
    };
};
