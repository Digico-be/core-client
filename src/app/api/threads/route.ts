import { NextResponse } from 'next/server';

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST() {
    try {
        const thread = await openai.beta.threads.create();
        return NextResponse.json(thread, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
