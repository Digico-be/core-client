import { useState } from 'react'

import { deleteFileMessage, readsFileMessages } from '../services/file_message'
import { FileService } from '../services/OpenAi/fileService'
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

        const toDelete = messages.slice(index)

        // suppression côté OpenAI
        await ThreadService.deleteMessagesFromThread(threadId, toDelete.map((msg) => msg.id))

        // suppression côté Laravel (liens + fichiers si plus utilisés)
        await deleteFileMessage(messageId)

        // suppression des fichiers dans OpenAI
        for (const msg of toDelete) {
            if (msg.attachments && msg.attachments.length > 0) {
                for (const file of msg.attachments) {
                    await FileService.delete(file.openai_id)
                }
            }
        }

        // suppression locale
        setMessages((prev) => prev.filter((m) => !toDelete.map((x) => x.id).includes(m.id)))
    }

    const editMessage = async (threadId: string, messageId: string, newContent: string) => {
        // Optimistic update
        setMessages(prev =>
            prev.map(m =>
                m.id === messageId
                    ? { ...m, content: newContent, pending: true }
                    : m
            )
        );

        const res = await ThreadService.editMessage(threadId, messageId, newContent);

        // Remplacement du message édité par celui retourné par l’API
        setMessages(prev =>
            prev.map(m =>
                m.id === messageId
                    ? {
                        ...m,
                        id: res.newMessage.id,
                        content: newContent,
                        timestamp: new Date(res.newMessage.created_at * 1000).toISOString(),
                        pending: false,
                    }
                    : m
            )
        );
    }

    return { messages, setMessages, loadMessages, deleteMessage, editMessage }
}

