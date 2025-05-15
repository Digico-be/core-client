'use client'

import React, { useState } from 'react'
import { clsx } from 'clsx'
import { toast } from 'sonner'

import { useFileUpload } from '../../hooks/useFileUpload'

import { IAFile } from '../../models/file'
import { Message } from '../../models/message'
import { Thread, ThreadMessageContent } from '../../models/thread'
import FileDropZone from '../file/FileDropZone'

import MessageList from './MessageList'

interface MessageInputProps {
    module: string
    assistantId: string
    tabId: string
    messages: Message[]
    streamedResponse: string
    sendMessage: (
        input: string | ThreadMessageContent[],
        attachments?: IAFile[],
        options?: { skipUserMessage?: boolean; skipAssistantMessage?: boolean }
    ) => Promise<void>
    deleteMessage: (threadId: string, messageId: string) => Promise<void>
    editMessage: (threadId: string, messageId: string, newContent: string) => Promise<void>
    thread: Thread | null
    compact?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ messages, streamedResponse, sendMessage, deleteMessage, editMessage, thread, compact }) => {
    const { uploadFile } = useFileUpload()

    const [userQuery, setUserQuery] = useState('')
    const [pendingFile, setPendingFile] = useState<IAFile | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isLocked, setIsLocked] = useState(false)

    const isSending = streamedResponse.length > 0
    const hasThread = !!thread?.id

    const handleSend = async () => {
        if (!hasThread) {
            toast.error('La conversation n’est pas encore prête.')
            return
        }

        const hasText = userQuery.trim() !== ''
        const hasFile = pendingFile !== null

        if (isSending || isLocked) return

        if (!hasText && hasFile) {
            toast.error('Vous devez poser une question avec le fichier.')
            return
        }
        if (!hasText && !hasFile) {
            toast.error('Veuillez saisir une question ou ajouter un fichier.')
            return
        }

        const content: ThreadMessageContent[] = []
        if (hasText) content.push({ type: 'text', text: userQuery.trim() })
        if (hasFile && !hasText) content.push({ type: 'text', text: '📎 Fichier joint' })

        const attachments = hasFile ? [pendingFile!] : undefined

        setIsLocked(true)
        await sendMessage(content, attachments)
        setIsLocked(false)

        setUserQuery('')
        setPendingFile(null)
    }

    const handleFileDrop = async (file: File) => {
        if (!hasThread) {
            toast.error('La conversation n’est pas encore prête.')
            return
        }

        toast.info(`📥 Dépôt de fichier : ${file.name}`)
        const uploaded = await uploadFile(file)

        if (uploaded) {
            toast.success('✅ Fichier uploadé')
            setPendingFile(uploaded)
        } else {
            toast.error('❌ Échec de l’upload')
        }
    }

    // @ts-ignore
    return (
        <div className="flex flex-col h-full w-full p-4 overflow-x-hidden">
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
                                    timestamp: new Date().toISOString()
                                }
                            ]
                            : [])
                    ]}
                    onDeleteMessage={async (id) => {
                        if (thread?.id) await deleteMessage(thread.id, id)
                    }}
                    onEditMessage={async (id, txt) => {
                        if (thread?.id) {
                            await editMessage(thread.id, id, txt)
                        }
                    }}
                />
            </div>

            <div className="mt-4">
                <FileDropZone onFileDrop={handleFileDrop} onDragStateChange={(dragging) => setIsDragging(dragging)} disabled={!hasThread}>
                    <div
                        className={clsx(
                            'flex gap-2 mt-4 items-center p-2 rounded-lg transition-all duration-200',
                            isDragging && 'border-blue-500 bg-blue-50 shadow-md cursor-copy',
                            !hasThread && 'opacity-50 cursor-not-allowed'
                        )}>
                        <button
                            type="button"
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="px-3 py-3 rounded-lg bg-grey-200 border border-grey-600"
                            disabled={!hasThread || isSending || isLocked}>
                            📎
                        </button>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                await handleFileDrop(file)
                            }}
                            disabled={!hasThread}
                        />

                        <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isSending && !isLocked && hasThread) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder={hasThread ? 'Posez une question…' : 'Création de la conversation…'}
                            className="min-w-0 flex-1 p-3 bg-grey-200 border border-grey-600 rounded-lg"
                            disabled={!hasThread || isSending || isLocked}
                        />

                        {pendingFile && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-grey-200 border border-grey-600 rounded-lg text-sm text-gray-700">
                                📎
                                {!compact && <span className="truncate max-w-[200px]">{pendingFile.filename}</span>}
                                <button type="button" onClick={() => setPendingFile(null)} className="text-red-500 hover:text-red-700 text-xs ml-2">
                                    ✕
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={!hasThread || isSending || isLocked || (userQuery.trim() === '' && !pendingFile)}
                            className={clsx(
                                'px-4 py-2 rounded-lg text-white transition duration-200 ease-in-out',
                                !hasThread || isSending || isLocked ? 'bg-grey-800 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'
                            )}>
                            {!hasThread ? '…' : isSending || isLocked ? 'Réponse…' : 'Envoyer'}
                        </button>
                    </div>
                </FileDropZone>
            </div>
        </div>
    )
}

export default MessageInput
