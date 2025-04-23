import { NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(_: Request, context: any) {
    const { threadId, runId } = context.params

    try {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId)
        return NextResponse.json(run, { status: 200 })
    } catch (error) {
        console.error('Erreur récupération status run :', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du statut du run' },
            { status: 500 }
        )
    }
}
