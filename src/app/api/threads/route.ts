import { NextResponse } from 'next/server';

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(req: Request) {
    const { assistantId, module } = await req.json();

    console.log('[API /api/threads] POST body:', { assistantId, module });

    try {
        const thread = await openai.beta.threads.create();
        console.log('[API /api/threads] OpenAI thread created:', thread.id);
        return NextResponse.json(thread, { status: 200 });
    } catch (err: any) {
        console.error('[API /api/threads] OpenAI create error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
