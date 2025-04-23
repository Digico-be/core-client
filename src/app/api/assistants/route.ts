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
    const assistant = await req.json();  // On récupère les données envoyées par le frontend

    if (!assistant.model) {
        return NextResponse.json({ error: 'Le modèle est requis' }, { status: 400 });
    }

    try {
        // Appel à l'API OpenAI pour créer un assistant
        const response = await openai.beta.assistants.create({
            instructions: assistant.instructions,
            name: assistant.name,
            tools: assistant.tools,
            model: assistant.model,
        });

        // Retourner la réponse de l'API OpenAI
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la création de l\'assistant:', error);
        return NextResponse.json({ error: 'Échec de la création de l\'assistant' }, { status: 500 });
    }
}

