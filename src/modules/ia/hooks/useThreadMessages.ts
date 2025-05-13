import { useState } from 'react'

import { readMessages } from '../services/message'
import { deleteMessage as deleteMessageAPI } from '../services/message/delete-message'
import { FileService } from '../services/OpenAi/fileService'
import { ThreadService } from '../services/OpenAi/threadService'

import { Message } from '../models/message'

export const useThreadMessages = () => {
    const [messages, setMessages] = useState<Message[]>([])

    const loadMessages = async (threadId: string) => {
        const list = await readMessages(threadId)

        const formatted: Message[] = list.map((m: any) => ({
            id:          m.openai_id,
            content:     m.raw_text ?? '',
            sender:      m.role === 'user' ? 'user' : 'assistant',
            timestamp:   m.created_at,
            threadId,
            attachments: (m.attachments ?? []).map((f: any) => ({
                openai_id: f.file_openai_id,
                filename:  f.filename,
                size:      f.size,
                mime_type: f.mime_type,
            })),
        }))

        setMessages(
            formatted.sort((a: Message, b: Message) => {
                const dA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                const dB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                return dA - dB
            }),
        )
    }

    const deleteMessage = async (threadId: string, messageId: string) => {
        const startIndex = messages.findIndex(m => m.id === messageId)
        if (startIndex === -1) return

        // ➜ on supprime le message ciblé + tous ceux qui le suivent (assistant)
        const toDelete   = messages.slice(startIndex)
        const ids        = toDelete.map(m => m.id)

        /* 1) OpenAI */
        await ThreadService.deleteMessagesFromThread(threadId, ids)

        /* 2) Laravel : boucle sur chaque id */
        for (const id of ids) {
            try {
                await deleteMessageAPI(id)
            } catch {/* ignore */}
        }

        /* 3) Fichiers OpenAI éventuels */
        for (const msg of toDelete) {
            for (const file of msg.attachments ?? []) {
                try {
                    await FileService.delete(file.openai_id)
                } catch {/* ignore */}
            }
        }

        /* 4) Mise à jour locale */
        setMessages(prev => prev.filter(m => !ids.includes(m.id)))
    }

    /* ------------------------------------------------------------------ */
    /* Édition (inchangé)                                                 */
    /* ------------------------------------------------------------------ */
    const editMessage = async (
        threadId: string,
        messageId: string,
        newContent: string,
    ) => {
        setMessages(prev =>
            prev.map(m =>
                m.id === messageId ? { ...m, content: newContent, pending: true } : m,
            ),
        )

        const res = await ThreadService.editMessage(threadId, messageId, newContent)

        setMessages(prev =>
            prev.map(m =>
                m.id === messageId
                    ? {
                        ...m,
                        id:        res.newMessage.id,
                        content:   newContent,
                        timestamp: new Date(res.newMessage.created_at * 1000).toISOString(),
                        pending:   false,
                    }
                    : m,
            ),
        )
    }

    return { messages, setMessages, loadMessages, deleteMessage, editMessage }
}
