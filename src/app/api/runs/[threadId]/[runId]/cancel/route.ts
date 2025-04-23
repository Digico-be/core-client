import { NextRequest, NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
})

export async function POST(req: NextRequest, context: any) {
    const { threadId, runId } = context.params;

    if (!threadId || !runId) {
        return NextResponse.json({ error: 'Thread ID et Run ID requis' }, { status: 400 });
    }

    try {
        const result = await openai.beta.threads.runs.cancel(threadId, runId);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("❌ Erreur annulation du run :", error?.response?.data || error);
        return NextResponse.json({ error: error?.message || 'Erreur annulation run' }, { status: 500 });
    }
}
