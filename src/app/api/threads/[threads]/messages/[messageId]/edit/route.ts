import { NextRequest, NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
})

export async function POST(
    req: NextRequest,
    context: any
) {
    const { threads: threadId, messageId } = context.params
    const { newContent } = await req.json()

    if (!newContent) {
        return NextResponse.json({ error: 'Le contenu mis à jour est requis.' }, { status: 400 })
    }

    try {
        const allMessages = await openai.beta.threads.messages.list(threadId)
        const sortedMessages = allMessages.data.sort((a, b) => a.created_at - b.created_at)

        const indexToModify = sortedMessages.findIndex((msg) => msg.id === messageId)
        if (indexToModify === -1) {
            return NextResponse.json({ error: 'Message introuvable dans le thread.' }, { status: 404 })
        }

        const messagesToDelete = sortedMessages.slice(indexToModify)

        for (const msg of messagesToDelete) {
            try {
                await openai.beta.threads.messages.del(threadId, msg.id)
            } catch (err) {
                console.warn(`⚠️ Échec suppression message ${msg.id} :`, err)
            }
        }

        const newMessage = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: newContent,
        })

        return NextResponse.json({ success: true, newMessage })
    } catch (error: any) {
        console.error('❌ Erreur API modification de message :', error)

        if (error.response) {
            const data =
                typeof error.response.json === 'function'
                    ? await error.response.json()
                    : error.response.data
            console.error('➡️ Status:', error.response.status)
            console.error('➡️ Data:', data)
        }

        return NextResponse.json(
            { error: 'Erreur lors de la modification du message' },
            { status: 500 }
        )
    }
}
