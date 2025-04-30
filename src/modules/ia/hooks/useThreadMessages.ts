import { useState } from 'react'

import { readsFileMessages } from '../services/file_message'
import { ThreadService } from '../services/OpenAi/threadService'

import { Message } from '../models/message'

export const useThreadMessages = () => {
    const [messages, setMessages] = useState<Message[]>([])

    const loadMessages = async (threadId: string) => {
        const rawMessages = await ThreadService.getMessagesFromThread(threadId)
        const fileLinks = await readsFileMessages(threadId)

        // mapping des fichiers liés par messageId
        const filesByMessageId: Record<string, Message['attachments']> = {}

        for (const link of fileLinks) {
            if (!link.file) continue;

            filesByMessageId[link.message_openai_id] ??= []

            filesByMessageId[link.message_openai_id]!.push({
                openai_id: link.file.openai_id,
                filename: link.file.filename,
                size: link.file.size,
                mime_type: link.file.mime_type
            })
        }


        const formatted = rawMessages.map((msg: any) => ({
            id: msg.id,
            content: msg.content?.[0]?.text?.value ?? '[Contenu vide]',
            sender: msg.role === 'user' ? 'user' : 'assistant',
            timestamp: new Date(msg.created_at * 1000).toISOString(),
            threadId,
            attachments: filesByMessageId[msg.id] ?? []
        })) as Message[]

        setMessages(
            formatted.sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                return dateA - dateB
            })
        )
    }

    const deleteMessage = async (threadId: string, messageId: string) => {
        const index = messages.findIndex((msg) => msg.id === messageId)
        if (index === -1) return

        const toDelete = messages.slice(index).map((msg) => msg.id)

        // Mise à jour locale
        setMessages((prev) => prev.filter((m) => !toDelete.includes(m.id)))

        // Suppression backend
        await ThreadService.deleteMessagesFromThread(threadId, toDelete)
    }

    const editMessage = async (threadId: string, messageId: string, newContent: string) => {
        const index = messages.findIndex((msg) => msg.id === messageId)
        if (index === -1) return

        const toDelete = messages.slice(index).map((msg) => msg.id)

        // Suppression locale
        setMessages((prev) => prev.filter((m) => !toDelete.includes(m.id)))

        // Appel backend
        const res = await ThreadService.editMessage(threadId, messageId, newContent)

        // Ajout nouveau message utilisateur (retourné par le backend)
        setMessages((prev) => [
            ...prev,
            {
                id: res.newMessage.id,
                content: newContent,
                sender: 'user',
                timestamp: new Date(res.newMessage.created_at * 1000).toISOString(),
                threadId,
            },
        ])
    }


    return { messages, setMessages, loadMessages, deleteMessage, editMessage }
}
