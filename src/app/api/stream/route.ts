import { createLangChainAgent } from '../../../modules/ia/utils/langchainAgent'

export async function POST(req: Request) {
    const { message, workspace } = await req.json();

    try {
        const agent = await createLangChainAgent(workspace);
        const result = await agent.invoke({ input: message });

        // ✅ On crée un vrai flux streaming avec la réponse complète
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                const jsonLine = JSON.stringify({
                    type: "full",
                    content: result.output,
                });

                controller.enqueue(encoder.encode(jsonLine + "\n"));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (err: any) {
        console.error("❌ Erreur LangChain Agent :", err);

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                const errorLine = JSON.stringify({
                    type: "error",
                    content: err.message || "Erreur inconnue",
                });

                controller.enqueue(encoder.encode(errorLine + "\n"));
                controller.close();
            },
        });

        return new Response(stream, {
            status: 500,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    }
}
