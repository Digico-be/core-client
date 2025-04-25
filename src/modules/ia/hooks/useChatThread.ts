import { useEffect, useState }   from 'react';

import { RunService } from '../services/OpenAi/runService'
import { StreamService } from '../services/OpenAi/streamService'
import { ThreadService } from '../services/OpenAi/threadService'
import { createThread, readThread } from '../services/thread';

import { Message } from '../models/message'
import { Thread, ThreadMessageContent } from '../models/thread'
import { SessionStorage } from '../utils/sessions'

import { useThreadMessages } from './useThreadMessages'

type LaravelThread = {
    openai_id: string;
    assistant_openai_id: string;
    module?: string;
    created_at: string;
};

export const useChatThread = (
    tabId: string,
    assistantId: string,
    module: string,
    workspaceSlug: string
) => {
    const [thread, setThread] = useState<Thread | null>(null);
    const [streamedResponse, setStreamedResponse] = useState<string>('');

    const { messages, setMessages, loadMessages, deleteMessage, editMessage } = useThreadMessages();

    const initThread = async () => {
        const existingOpenAiId = SessionStorage.getThreadIdForTab(tabId);

        if (existingOpenAiId) {
            const response = await readThread(existingOpenAiId);

            const threadFromLaravel = response.data as unknown as LaravelThread;

            const formattedThread: Thread = {
                id: threadFromLaravel.openai_id,
                assistantId: threadFromLaravel.assistant_openai_id,
                module: threadFromLaravel.module,
                createdAt: threadFromLaravel.created_at,
            };

            setThread(formattedThread);
            await loadMessages(formattedThread.id);
        } else {
            const created = await ThreadService.createThread(assistantId, module);

            const savedResponse = await createThread(
                created.id,
                assistantId,
                module
            );

            setThread(savedResponse);
            SessionStorage.setThreadIdForTab(tabId, savedResponse.id);
            await loadMessages(savedResponse.id);
        }
    };

    const sendMessage = async (
        input: string | ThreadMessageContent[],
        attachments?: string[]
    ) => {
        if (!thread?.id) return;

        setStreamedResponse('');

        const content: ThreadMessageContent[] =
            typeof input === 'string' ? [{ type: 'text', text: input }] : input;

        const hasFile = !!attachments?.length;

        const userRes = await ThreadService.sendMessageToThread(
            thread.id,
            content,
            'user',
            attachments
        );

        const userMessage: Message = {
            id: userRes.id,
            sender: 'user',
            content: content.find((c) => c.type === 'text')?.text ?? '',
            type: hasFile ? 'file' : 'text',
            timestamp: new Date(userRes.created_at * 1000).toISOString(),
            threadId: thread.id,
            file: hasFile && attachments?.[0]
                ? {
                    file_id: attachments[0],
                    filename: attachments[0].split('/').pop() ?? 'Fichier'
                }
                : undefined
        };

        setMessages((prev) => [...prev, userMessage]);

        const thinkingMessage: Message = {
            id: 'thinking',
            content: '🤖 L’assistant réfléchit...',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            threadId: thread.id,
        };
        setMessages((prev) => [...prev, thinkingMessage]);

        if (!hasFile) {
            let first = true;
            let fullResponse = '';

            const textToUse = content.find((item) => item.type === 'text')?.text ?? '';

            fullResponse = await StreamService.startStreamingResponse(
                textToUse,
                (token) => {
                    if (first) {
                        setMessages((prev) => prev.filter((m) => m.id !== 'thinking'));
                        first = false;
                    }
                    setStreamedResponse((prev) => prev + token);
                },
                workspaceSlug,
                (name, args) => console.log('🛠️ Function call', name, args)
            );

            // Protection ici : ne pas envoyer une réponse vide
            if (fullResponse.trim().length > 0) {
                const assistantRes = await ThreadService.sendMessageToThread(
                    thread.id,
                    [{ type: 'text', text: fullResponse }],
                    'assistant'
                );

                const assistantMessage: Message = {
                    id: assistantRes.id,
                    content: fullResponse,
                    sender: 'assistant',
                    timestamp: new Date(assistantRes.created_at * 1000).toISOString(),
                    threadId: thread.id,
                };

                // 🔄 Corriger l'ordre ici
                setStreamedResponse('');
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                setStreamedResponse('');
                setMessages((prev) => prev.filter((m) => m.id !== 'thinking'));
            }


            setStreamedResponse('');

            return;
        }

        // === Fichier joint ===
        try {
            const run = await RunService.startRun(thread.id, assistantId);

            const interval = setInterval(async () => {
                const status = await RunService.getStatus(thread.id, run.id);

                if (status.status === 'completed') {
                    clearInterval(interval);

                    const newMessages = await ThreadService.getMessagesFromThread(thread.id);
                    const assistantMsg = newMessages.find((msg) => msg.role === 'assistant');

                    if (assistantMsg) {
                        const assistantMessage: Message = {
                            id: assistantMsg.id,
                            content: assistantMsg.content[0]?.text?.value || '[Réponse assistant]',
                            sender: 'assistant',
                            timestamp: new Date(assistantMsg.created_at * 1000).toISOString(),
                            threadId: thread.id,
                        };
                        setMessages((prev) => [
                            ...prev.filter((m) => m.id !== 'thinking'),
                            assistantMessage,
                        ]);
                    }
                } else if (status.status === 'failed') {
                    clearInterval(interval);
                    console.error('❌ Run failed');
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === 'thinking'
                                ? { ...m, content: '❌ Erreur lors du traitement du fichier.' }
                                : m
                        )
                    );
                }
            }, 2000);
        } catch (err) {
            console.error('❌ Erreur lors du run assistant :', err);
        }
    };

    useEffect(() => {
        initThread();
    }, [tabId, assistantId]);

    return {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        thread
    };
};
