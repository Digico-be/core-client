'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

import { useFileUpload } from '../../hooks/useFileUpload';

import { IAFile } from '../../models/file';
import { Message } from '../../models/message';
import { Thread, ThreadMessageContent } from '../../models/thread';
import FileDropZone from '../file/FileDropZone';

import MessageList from './MessageList';

interface MessageInputProps {
    module: string;
    assistantId: string;
    tabId: string;

    /** ⬇️ données et actions injectées depuis AssistantBase */
    messages: Message[];
    streamedResponse: string;
    sendMessage: (
        input: string | ThreadMessageContent[],
        attachments?: IAFile[],
        options?: { skipUserMessage?: boolean; skipAssistantMessage?: boolean }
    ) => Promise<void>;
    deleteMessage: (threadId: string, messageId: string) => Promise<void>;
    editMessage: (threadId: string, messageId: string, newContent: string) => Promise<void>;
    thread: Thread | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
                                                       messages,
                                                       streamedResponse,
                                                       sendMessage,
                                                       deleteMessage,
                                                       editMessage,
                                                       thread,
                                                   }) => {
    const { uploadFile } = useFileUpload();

    const [userQuery, setUserQuery] = useState('');
    const [pendingFile, setPendingFile] = useState<IAFile | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const isSending = streamedResponse.length > 0;

    /** ─────── Handlers */
    const handleSend = async () => {
        const hasText = userQuery.trim() !== '';
        const hasFile = pendingFile !== null;

        if (isSending || isLocked) return;

        if (!hasText && hasFile) {
            toast.error('Vous devez poser une question avec le fichier.');
            return;
        }
        if (!hasText && !hasFile) {
            toast.error('Veuillez saisir une question ou ajouter un fichier.');
            return;
        }

        const content: ThreadMessageContent[] = [];
        if (hasText) content.push({ type: 'text', text: userQuery.trim() });
        if (hasFile && !hasText) content.push({ type: 'text', text: '📎 Fichier joint' });

        const attachments = hasFile ? [pendingFile!] : undefined;

        setIsLocked(true); // 🔒 verrouillage
        await sendMessage(content, attachments);
        setIsLocked(false); // 🔓 déverrouillage

        setUserQuery('');
        setPendingFile(null);
    };

    const handleFileDrop = async (file: File) => {
        toast.info(`📥 Dépôt de fichier : ${file.name}`);
        const uploaded = await uploadFile(file);

        if (uploaded) {
            toast.success('✅ Fichier uploadé');
            setPendingFile(uploaded);
        } else {
            toast.error('❌ Échec de l’upload');
        }
    };


    return (
        <div className="flex flex-col h-full w-full p-4 overflow-x-hidden">
            {/* Zone messages scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <MessageList
                    messages={[
                        ...messages,
                        ...(streamedResponse
                            ? [
                                {
                                    id: 'streaming',
                                    content: streamedResponse,
                                    sender: 'assistant' as const,
                                    timestamp: new Date().toISOString(),
                                },
                            ]
                            : []),
                    ]}
                    onDeleteMessage={async (id) => {
                        if (thread?.id) await deleteMessage(thread.id, id);
                    }}
                    onEditMessage={async (id, txt) => {
                        if (thread?.id) {
                            await editMessage(thread.id, id, txt);
                            // Ne pas renvoyer sendMessage ici pour éviter doublon
                        }
                    }}
                />
            </div>

            {/* Zone input */}
            <div className="mt-4">
                <FileDropZone
                    onFileDrop={handleFileDrop}
                    onDragStateChange={(dragging) => setIsDragging(dragging)}
                >
                    <div
                        className={clsx(
                            'flex gap-2 mt-4 items-center border p-2 rounded-lg transition-all duration-200',
                            isDragging && 'border-blue-500 bg-blue-50 shadow-md cursor-copy',
                        )}
                    >
                        {/* bouton fichier */}
                        <button
                            type="button"
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="px-3 py-2 rounded-lg border hover:bg-gray-100"
                            disabled={isSending || isLocked}
                        >
                            📎
                        </button>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                await handleFileDrop(file);
                            }}
                        />

                        {/* input texte */}
                        <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isSending && !isLocked) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Posez une question…"
                            className="min-w-0 flex-1 p-3 border rounded-lg"
                            disabled={isSending || isLocked}
                        />

                        {/* aperçu fichier */}
                        {pendingFile && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-700">
                                📎 <span>{pendingFile.filename}</span>
                                <button
                                    type="button"
                                    onClick={() => setPendingFile(null)}
                                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* bouton envoyer */}
                        <button
                            onClick={handleSend}
                            disabled={isSending || isLocked || (userQuery.trim() === '' && !pendingFile)}
                            className={`px-4 py-2 rounded-lg text-white transition duration-200 ease-in-out ${
                                isSending || isLocked
                                    ? 'bg-grey-800 cursor-not-allowed'
                                    : 'bg-primary hover:bg-blue-600'
                            }`}
                        >
                            {isSending || isLocked ? 'Réponse…' : 'Envoyer'}
                        </button>
                    </div>
                </FileDropZone>
            </div>
        </div>
    );
};

export default MessageInput;
