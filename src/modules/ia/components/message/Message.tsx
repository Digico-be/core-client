'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

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

const Message: React.FC<MessageProps> = ({ id, content, sender, timestamp, type = 'text', attachments = [], link, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(content)

    const formattedTimestamp = timestamp
        ? new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
          })
        : '---'

    const displayContent = link ? `${content}\n\n🔗 [Voir sur la plateforme](${link})` : content

    return (
        <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} px-4`}>
            <div className={`p-4 max-w-[80%] md:max-w-[900px] rounded-lg shadow-md ${sender === 'user' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                <div className="whitespace-pre-wrap mb-2 space-y-2 flex-col">
                    {isEditing ? (
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full resize-none p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 placeholder:text-gray-400"
                            placeholder="Modifiez votre message..."
                            rows={4}
                        />
                    ) : (
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        {children}
                                    </a>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto text-sm font-mono bg-white p-2 rounded border border-gray-300">
                                        <table className="table-auto whitespace-pre">{children}</table>
                                    </div>
                                ),
                                th: ({ children }) => (
                                    <th className="px-2 py-1 text-left border-b border-gray-400">{children}</th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-2 py-1 whitespace-nowrap align-top">{children}</td>
                                ),
                            }}
                        >
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
                                ✏️ Modifier
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition">
                            🗑️ Supprimer
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
