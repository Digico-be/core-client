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

export async function POST(req: Request) {
    const assistantData = await req.json();  // On récupère les données envoyées par le frontend

    if (!assistantData.model) {
        return NextResponse.json({ error: 'Le modèle est requis' }, { status: 400 });
    }

    try {
        const assistant = await openai.beta.assistants.create({
            instructions: assistantData.instructions,
            name: assistantData.name,
            tools: assistantData.tools,
            model: assistantData.model,
        });

        return NextResponse.json({
            id: assistant.id,
            name: assistant.name,
            description: assistant.description,
            model: assistant.model,
            instructions: assistant.instructions,
            tools: assistant.tools
        }, { status: 200 });

    } catch (error) {
        console.error('Erreur lors de la création de l\'assistant:', error);
        return NextResponse.json({ error: 'Échec de la création de l\'assistant' }, { status: 500 });
    }
}

