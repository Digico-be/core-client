import { NextRequest, NextResponse } from 'next/server'

import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
    throw new Error('The OPENAI_API_KEY environment variable is missing or empty')
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
})

export async function DELETE(req: NextRequest, { params }: { params: { threadId: string } }) {
    const { threadId } = params

    if (!threadId) {
        return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
    }

    try {
        // 1. Supprimer le thread chez OpenAI
        await openai.beta.threads.del(threadId)

        // 2. Répondre sans contenu (204)
        return new NextResponse(null, { status: 204 })
    } catch (err: any) {
        console.error(`Erreur suppression OpenAI thread ${threadId}:`, err)
        return NextResponse.json(
            { error: err.message || 'Échec suppression du thread' },
            { status: err.status || 500 }
        )
    }
}
