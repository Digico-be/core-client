'use client'

import React, { useState } from 'react'
import { useAuth } from '@digico/utils'
import {clsx} from "clsx";
import { toast } from "sonner";

import { useChatThread } from '../../hooks/useChatThread'
import { useFileUpload } from '../../hooks/useFileUpload'

import { IAFile } from '../../models/file'
import { ThreadMessageContent } from '../../models/thread'
import FileDropZone from '../file/FileDropZone'

import MessageList from './MessageList'



interface MessageInputProps {
    module: string
    assistantId: string
    tabId: string
}

const MessageInput: React.FC<MessageInputProps> = ({ module, assistantId, tabId }) => {
    const { tenant } = useAuth() //TODO : Risque de problème
    const { uploadFile } = useFileUpload()
    const [userQuery, setUserQuery] = useState('')
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [pendingFile, setPendingFile] = useState<IAFile | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const { messages, streamedResponse, sendMessage, deleteMessage, editMessage, thread } = useChatThread(tabId, assistantId, module, tenant?.name ?? '')

    const isSending = streamedResponse.length > 0

    const handleSend = async () => {
        const hasText = userQuery.trim() !== ''
        const hasFile = pendingFile !== null

        if (isSending) return;

        if (!hasText && hasFile) {
            toast.error("Vous devez poser une question avec le fichier.")
            return
        }

        if (!hasText && !hasFile) {
            toast.error("Veuillez saisir une question ou ajouter un fichier.")
            return
        }

        const content: ThreadMessageContent[] = []

        if (hasText) {
            content.push({ type: 'text', text: userQuery.trim() })
        }

        if (hasFile && !hasText) {
            content.push({ type: 'text', text: '📎 Fichier joint' })
        }

        const attachments = hasFile ? [pendingFile!.id] : undefined
        console.debug('🟢 [MessageInput] Envoi message avec :', {
            text: userQuery.trim(),
            hasFile: !!pendingFile,
            pendingFile,
        });
        await sendMessage(content, attachments)

        setUserQuery('')
        setPendingFile(null)
    }

    const handleDeleteMessage = async (id: string) => {
        if (!thread?.id) return;
        await deleteMessage(thread.id, id);
    };

    const handleEditMessage = async (id: string, newContent: string) => {
        if (!thread?.id) return;
        await editMessage(thread.id, id, newContent);

        // 💡 Ensuite relancer une réponse assistant (optionnel)
        const last = newContent.trim();
        if (last.length > 0) {
            await sendMessage(last);
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-4 overflow-x-hidden">
            {/* Zone messages scrollable */}
            <div ref={scrollRef} className="overflow-y-auto" style={{ height: 'calc(100vh - 30rem)' }}>
                <MessageList
                    messages={[
                        ...messages,
                        ...(streamedResponse
                            ? [
                                {
                                    id: 'streaming',
                                    content: streamedResponse,
                                    sender: 'assistant' as const,
                                    timestamp: new Date().toISOString()
                                }
                            ]
                            : [])
                    ]}
                    onDeleteMessage={handleDeleteMessage}
                    onEditMessage={handleEditMessage}
                />
            </div>

            <div className="w-full px-4">
                <FileDropZone
                    onFileDrop={async (file) => {
                        toast.info(`📥 Dépôt de fichier : ${file.name}`);
                        const uploaded = await uploadFile(file);
                        if (!uploaded) {
                            toast.error("❌ Échec de l’upload");
                            return;
                        }
                        toast.success("✅ Fichier uploadé avec succès");
                        setPendingFile(uploaded);
                    }}
                    onDragStateChange={(dragging) => setIsDragging(dragging)}
                >
                    <div
                        className={clsx(
                            'flex gap-2 mt-4 items-center border p-2 rounded-lg transition-all duration-200',
                            isDragging && 'border-blue-500 bg-blue-50 shadow-md cursor-copy'
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="px-3 py-2 rounded-lg border hover:bg-gray-100"
                            disabled={isSending}
                        >
                            📎
                        </button>

                        {/* Input fichier caché */}
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                toast.info(`📤 Upload fichier via 📎 : ${file.name}`);
                                const uploaded = await uploadFile(file);
                                if (uploaded) {
                                    toast.success("✅ Fichier uploadé");
                                    setPendingFile(uploaded);
                                } else {
                                    toast.error("❌ Upload échoué");
                                }
                            }}
                        />

                        {/* Zone de texte */}
                        <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Posez une question..."
                            className="min-w-0 flex-1 p-3 border rounded-lg"
                            disabled={isSending}
                        />
                        {/* Aperçu du fichier en attente */}
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

                        {/* Bouton envoyer */}
                        <button
                            onClick={handleSend}
                            disabled={isSending || (userQuery.trim() === '' && !pendingFile)}
                            className={`px-4 py-2 rounded-lg text-white transition duration-200 ease-in-out ${
                                isSending
                                    ? 'bg-grey-800 cursor-not-allowed'
                                    : 'bg-primary hover:bg-blue-600'
                            }`}
                        >
                            {isSending ? 'Réponse...' : 'Envoyer'}
                        </button>

                    </div>
                </FileDropZone>
            </div>
        </div>
    );

}

export default MessageInput
