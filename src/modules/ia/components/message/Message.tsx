'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface MessageProps {
    id: string
    content: string
    sender: 'user' | 'assistant'
    timestamp?: string | null
    type?: 'text' | 'file'
    attachments?: {
        openai_id: string
        filename: string
        size: number
        mime_type: string
    }[]
    onDelete: (id: string) => void
    onEdit: (id: string, newContent: string) => void
}

const Message: React.FC<MessageProps> = ({
                                             id,
                                             content,
                                             sender,
                                             timestamp,
                                             type = 'text',
                                             attachments = [],
                                             onDelete,
                                             onEdit
                                         }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(content)

    const formattedTimestamp = timestamp
        ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '---'

    const handleEditClick = () => setIsEditing(true)
    const handleCancelClick = () => {
        setEditedText(content)
        setIsEditing(false)
    }
    const handleSaveClick = () => {
        onEdit(id, editedText)
        setIsEditing(false)
    }

    return (
        <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} px-4`}>
            <div
                className={`p-4 max-w-[80%] rounded-lg shadow-md ${
                    sender === 'user' ? 'bg-blue-100' : 'bg-gray-200'
                }`}
            >
                {/* Contenu du message */}
                <div className="whitespace-pre-wrap mb-2">
                    {type === 'file' && attachments.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {attachments.map((file) => (
                                <a
                                    key={file.openai_id}
                                    href={`https://api.openai.com/v1/files/${file.openai_id}/content`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800"
                                >
                                    📎 {file.filename}
                                </a>
                            ))}
                        </div>
                    ) : isEditing ? (
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
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    )}
                </div>

                {/* Actions utilisateur */}
                {!isEditing && sender === 'user' && type === 'text' && (
                    <div className="flex justify-end gap-2 mt-3 pt-2 text-sm">
                        <button
                            onClick={handleEditClick}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                            ✏️ Modifier
                        </button>
                        <button
                            onClick={() => onDelete(id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                        >
                            🗑️ Supprimer
                        </button>
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-500 block mt-1">{formattedTimestamp}</span>

                {/* Actions en mode édition */}
                {isEditing && (
                    <div className="flex gap-2 justify-end mt-2">
                        <button
                            onClick={handleSaveClick}
                            className="text-green-500 hover:text-green-700 text-sm"
                        >
                            Enregistrer
                        </button>
                        <button
                            onClick={handleCancelClick}
                            className="text-red-500 hover:text-red-700 text-sm"
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Message
