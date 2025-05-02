export const createThread = async (assistantId: string, module?: string) => {
    try {
        const response = await fetch('/api/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assistantId, module })
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la création du thread')
        }

        return await response.json()
    } catch (error) {
        console.error('Erreur lors de la création du thread:', error)
        throw new Error('Erreur lors de la création du thread')
    }
}


export const sendStructuredMessageToThread = async ({
    threadId,
    content,
    attachments,
    role
}: {
    threadId: string
    content: Array<{ type: 'text'; text: string }>
    attachments?: string[]
    role: 'user' | 'assistant'
}) => {
    const formattedAttachments = attachments?.filter(Boolean).map((id) => ({
        file_id: id,
        tools: [{ type: 'file_search' as const }]
    }))

    const payload: any = { role, content }

    if (formattedAttachments && formattedAttachments.length > 0) {
        payload.attachments = formattedAttachments
    }

    const response = await fetch(`/api/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const errText = await response.text()
        console.error('Serveur a répondu avec une erreur :', errText)
        throw new Error("Erreur lors de l'envoi du message")
    }

    return await response.json()
}

export const getMessagesFromThread = async (threadId: string) => {
    try {
        const response = await fetch(`/api/threads/${threadId}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des messages du thread')
        }

        return await response.json()
    } catch (error) {
        console.error('Erreur dans getMessagesFromThread:', error)
        throw error
    }
}

export const deleteThread = async (threadId: string) => {
    const resp = await fetch(`/api/threads/${encodeURIComponent(threadId)}`, {
        method: 'DELETE',
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Échec suppression thread ${threadId} : ${err}`);
    }
};

export const deleteMessagesFromThread = async (threadId: string, messageIds: string[]) => {
    try {
        const response = await fetch(`/api/threads/${threadId}/messages`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messageIds })
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression des messages du thread')
        }

        return await response.json()
    } catch (error) {
        console.error('Erreur dans deleteMessagesFromThread:', error)
        throw error
    }
}

export const editMessageInThread = async (threadId: string, messageId: string, newContent: string) => {
    const response = await fetch(`/api/threads/${threadId}/messages/${messageId}/edit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newContent })
    })

    if (!response.ok) {
        throw new Error('Erreur lors de la modification du message')
    }

    return await response.json()
}
