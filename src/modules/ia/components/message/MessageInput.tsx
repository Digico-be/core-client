'use client'

import React, { useState } from 'react'
import { clsx } from 'clsx'
import { toast } from 'sonner'

import { useFileUpload } from '../../hooks/useFileUpload'

import { Icon } from '@components/Icon'

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
        <div
            className="flex flex-col h-full w-full p-4 overflow-x-hidden custom-scrollbar">
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
                        if (thread?.id) await editMessage(thread.id, id, txt)
                    }}
                />
            </div>

            <div className="mt-4">
                <FileDropZone onFileDrop={handleFileDrop} onDragStateChange={(dragging) => setIsDragging(dragging)} disabled={!hasThread}>
                    <div
                        className={clsx(
                            'shrink-0 flex items-center w-full bg-white px-4 py-3 rounded-full border border-main/10',
                            'transition-all duration-200',
                            isDragging && 'border border-blue bg-blue-50 shadow-md cursor-copy',
                            !hasThread && 'opacity-50 cursor-not-allowed'
                        )}
                        style={{
                            filter: 'drop-shadow(0px 14px 31px rgba(158, 158, 158, 0.10)) drop-shadow(0px 57px 57px rgba(158, 158, 158, 0.09)) drop-shadow(0px 127px 76px rgba(158, 158, 158, 0.05)) drop-shadow(0px 227px 91px rgba(158, 158, 158, 0.01)) drop-shadow(0px 354px 99px rgba(158, 158, 158, 0.00))'
                        }}>
                        <button
                            type="button"
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="shrink-0 w-20 h-20 rounded-full bg-grey-200 flex items-center justify-center text-xs"
                            disabled={!hasThread || isSending || isLocked}>
                            <Icon name="upload" className="w-12 h-12" />
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
                            placeholder={hasThread ? 'Posez moi une question' : 'Création de la conversation…'}
                            className="min-w-0 flex-1 mx-4 bg-transparent focus:outline-none"
                            disabled={!hasThread || isSending || isLocked}
                        />

                        {pendingFile && (
                            <div className="w-3/16 flex items-center gap-2 px-6 py-2 bg-grey-200 border border-main/10 rounded-full text-smml-2">
                                {!compact && <span className="truncate max-w-[200px]">{pendingFile.filename}</span>}
                                <button type="button" onClick={() => setPendingFile(null)} className="text-red-500 text-xs ml-2">
                                    ✕
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={!hasThread || isSending || isLocked || (userQuery.trim() === '' && !pendingFile)}
                            className={clsx(
                                'shrink-0 px-6 py-2 rounded-full text-white transition duration-200 ease-in-out ml-2',
                                !hasThread || isSending || isLocked ? 'bg-grey-600 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'
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
