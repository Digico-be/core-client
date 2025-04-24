import { NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    throw new Error('The OPENAI_API_KEY environment variable is missing or empty');
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
});

// DELETE
export async function DELETE(req: NextRequest, context: any) {
    const { assistantId } = await context.params;

    try {
        await openai.beta.assistants.del(assistantId);
        return NextResponse.json({
            success: true,
            message: `Assistant ${assistantId} supprimé avec succès`,
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'assistant:", error);
        return NextResponse.json({ error: "Erreur lors de la suppression de l'assistant" }, { status: 500 });
    }
}

// GET
export async function GET(req: NextRequest, context: any) {
    const { assistantId } = await context.params;

    try {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        return NextResponse.json(assistant);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'assistant:", error);
        return NextResponse.json({ error: 'Assistant non trouvé' }, { status: 404 });
    }
}
