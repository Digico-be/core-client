import { NextRequest, NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
})

export async function POST(req: NextRequest, context: any) {
    const { threads } = context.params;
    const { content, attachments = [], role = 'user' } = await req.json();

    if (!Array.isArray(content) || content.length === 0) {
        return NextResponse.json({ error: 'Le contenu est requis (array)' }, { status: 400 });
    }

    if (!threads || !threads.startsWith('thread')) {
        return NextResponse.json({ error: `threadId invalide : ${threads}` }, { status: 400 });
    }

    try {
        const response = await openai.beta.threads.messages.create(threads, {
            role,
            content,
            attachments: attachments.length > 0 ? attachments : undefined
        });

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("Erreur lors de l'envoi du message:", error);
        return NextResponse.json({ error: error?.message || "Échec de l'envoi du message" }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const threadId = pathname.split('/').at(-2);

    if (!threadId || !threadId.startsWith('thread')) {
        return NextResponse.json({ error: `threadId invalide : ${threadId}` }, { status: 400 });
    }

    try {
        const messages = await openai.beta.threads.messages.list(threadId);
        return NextResponse.json(messages.data, { status: 200 });
    } catch (error: any) {
        console.error('❌ Erreur récupération des messages du thread :', error?.response?.data || error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const threadId = pathname.split('/').at(-2);

    if (!threadId || !threadId.startsWith('thread')) {
        return NextResponse.json({ error: `Invalid thread ID: '${threadId}'` }, { status: 400 });
    }

    try {
        const { messageIds } = await req.json();

        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json({ error: 'Le champ messageIds est requis et doit être un tableau non vide.' }, { status: 400 });
        }

        const deletionResults = [];

        for (const messageId of messageIds) {
            try {
                const result = await openai.beta.threads.messages.del(threadId, messageId);
                deletionResults.push(result);
            } catch (err) {
                console.warn(`Échec suppression du message ${messageId}`, err);
            }
        }


        return NextResponse.json({
            success: true,
            deleted: deletionResults,
        });
    } catch (error: any) {
        console.error("❌ Erreur lors de la suppression des messages :", error?.response?.data || error);
        return NextResponse.json({ error: error?.message || 'Erreur lors de la suppression des messages' }, { status: 500 });
    }
}