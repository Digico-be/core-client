import { NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: 'https://api.openai.com/v1',
});

export async function DELETE(
    req: NextRequest,
    ctx: { params: Record<string, string | string[]> }
) {

    // ➜ 1.récupère l’id, même si Next n’injecte pas correctement:
    const threadId =
        typeof ctx.params.threadId === 'string'
            ? ctx.params.threadId
            : ctx.params.slug ?? ctx.params.id ?? req.nextUrl.pathname.split('/').pop();

    if (!threadId) {
        return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    try {
        /* OpenAI ----------------------------- */
        await openai.beta.threads.del(threadId as string);

        /* Laravel/DB ----------------------- */
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${apiUrl}/api/threads/${threadId}`, { method: 'DELETE' });

        /* OK -------------------------------- */
        return new NextResponse(null, { status: 204 });
    } catch (err: any) {
        console.error(`[API] ✗ exception suppression ${threadId}:`, err);
        return NextResponse.json(
            { error: err.message ?? 'Échec suppression du thread' },
            { status: 500 }
        );
    }
}
