'use client'

import React from 'react'

import Message from './Message'

interface MessageListProps {
    messages: {
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
    }[]
    onDeleteMessage: (id: string) => void
    onEditMessage: (id: string, newContent: string) => void
}

const MessageList: React.FC<MessageListProps> = ({ messages, onDeleteMessage, onEditMessage }) => {
    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <Message
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    sender={message.sender}
                    timestamp={message.timestamp}
                    type={message.type}
                    attachments={message.attachments}
                    onDelete={onDeleteMessage}
                    onEdit={onEditMessage}
                />
            ))}
        </div>
    )
}

export default MessageList
