import { NextResponse } from 'next/server';

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    throw new Error('The OPENAI_API_KEY environment variable is missing or empty');
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
});

export async function POST() {
    try {
        // Création du thread
        const thread = await openai.beta.threads.create();
        return NextResponse.json(thread, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la création du thread:', error);
        return NextResponse.json({ error: 'Échec de la création du thread' }, { status: 500 });
    }
}
