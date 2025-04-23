import { NextResponse } from 'next/server'

import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY manquante')
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
})

export async function POST(req: Request, context: any) {
    const { threadId } = context.params

    try {
        const body = await req.json()
        const { assistant_id, instructions, model, metadata } = body

        if (!assistant_id) {
            return NextResponse.json({ error: 'assistant_id requis' }, { status: 400 })
        }

        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id,
            instructions,
            model,
            metadata,
        })

        return NextResponse.json(run, { status: 200 })
    } catch (error) {
        console.error('Erreur API OpenAI pour run:', error)
        return NextResponse.json({ error: 'Échec de la création du run' }, { status: 500 })
    }
}
