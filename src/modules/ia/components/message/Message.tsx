'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { Icon } from '@components/Icon'

import AttachmentPreview from '../file/AttachmentPreview'

interface Attachment {
    openai_id: string
    filename: string
    size: number
    mime_type: string
}

interface MessageProps {
    id: string
    content: string
    sender: 'user' | 'assistant'
    timestamp?: string | null
    type?: 'text' | 'file'
    attachments?: Attachment[]
    link?: string
    onDelete: (id: string) => void
    onEdit: (id: string, newContent: string) => void
}

// 🔍 Détection de tableau GPT brut (Markdown brut bien aligné)
function isRawGPTTable(content: string): boolean {
    return content.includes('|') && content.includes('---') && content.includes('\n')
}

const Message: React.FC<MessageProps> = ({ id, content, sender, timestamp, type = 'text', attachments = [], link, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(content)

    const formattedTimestamp = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'

    const displayContent = link ? `${content}\n\n🔗 [Voir sur la plateforme](${link})` : content

    const isTable = isRawGPTTable(displayContent)
    const [copied, setCopied] = useState(false)

    return (
        <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} px-4`}>
            <div
                className={`p-4 ${isTable ? 'w-full max-w-full' : 'max-w-[80%] md:max-w-[900px]'} rounded-lg shadow-md ${
                    sender === 'user' ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                <div className="whitespace-pre-wrap mb-2 space-y-2 flex-col">
                    {isEditing ? (
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full resize-none p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 placeholder:text-gray-400"
                            placeholder="Modifiez votre message..."
                            rows={4}
                        />
                    ) : isTable ? (
                        <div className="w-full overflow-x-auto rounded-lg border border-grey-400 bg-white shadow-inner relative">
                            {/* Bandeau d’en-tête */}
                            <div className="flex items-center justify-between p-3 bg-grey-200 border-b border-gray-300 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <Icon name="ia" className="w-5 h-5 text-gray-700" />
                                    <span className="font-semibold text-sm text-gray-800 uppercase tracking-wide">Rapport généré par l’assistant</span>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(displayContent)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 1500)
                                    }}
                                    className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition"
                                    title="Copier le contenu du rapport">
                                    {copied ? '✅ Copié !' : '📋 Copier'}
                                </button>
                            </div>

                            {/* Contenu du rapport */}
                            <pre className="min-w-full font-mono text-sm text-black p-4 whitespace-pre leading-relaxed overflow-x-auto">{displayContent}</pre>
                        </div>
                    ) : (
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                        {children}
                                    </a>
                                )
                            }}>
                            {displayContent}
                        </ReactMarkdown>
                    )}
                </div>

                {!isEditing && sender === 'user' && (type === 'text' || attachments.length === 0) && (
                    <div className="flex justify-end gap-2 mt-3 pt-2 text-sm">
                        {attachments.length === 0 && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                                <Icon name="edit" className="w-6 h-6" />
                                Modifier
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition">
                            <Icon name="trash" className="w-6 h-6" />
                            Supprimer
                        </button>
                    </div>
                )}

                <span className="text-xs text-gray-500 block mt-1">{formattedTimestamp}</span>

                {isEditing && (
                    <div className="flex gap-2 justify-end mt-2 pb-2">
                        <button
                            onClick={() => {
                                onEdit(id, editedText)
                                setIsEditing(false)
                            }}
                            className="text-green-500 hover:text-green-700 text-sm">
                            Enregistrer
                        </button>
                        <button
                            onClick={() => {
                                setEditedText(content)
                                setIsEditing(false)
                            }}
                            className="text-red-500 hover:text-red-700 text-sm">
                            Annuler
                        </button>
                    </div>
                )}

                {attachments.length > 0 && (
                    <div className="flex flex-col gap-2 pt-8">
                        {attachments.map((file) => (
                            <AttachmentPreview key={`${id}-${file.openai_id}`} {...file} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Message
