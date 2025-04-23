import React from 'react';

import Message from './Message';

interface MessageListProps {
    messages: {
        id: string;
        content: string;
        sender: 'user' | 'assistant';
        timestamp?: string | null;
        type?: 'text' | 'file';
        file?: {
            file_id: string;
            filename?: string;
        };
    }[];
    onDeleteMessage: (id: string) => void;
    onEditMessage: (id: string, newContent: string) => void;
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
                    onDelete={onDeleteMessage}
                    onEdit={onEditMessage}
                    timestamp={message.timestamp}
                />
            ))}
        </div>
    );
};

export default MessageList;
