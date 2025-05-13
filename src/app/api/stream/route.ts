
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const { createLangChainAgent } = await import('../../../modules/ia/utils/langchainAgent')

export async function POST(req: Request) {
    const { message, workspace, module } = await req.json() // On reçoit aussi `module`

    try {
        // 🟢 CAS SPÉCIAL RADAR : utilisation de web_search_preview
        if (module === 'radar') {
            const response = await openai.responses.create({
                model: 'gpt-4.1',
                tools: [{ type: 'web_search_preview' }],
                input: message,
            })

            // Création du flux pour retourner la réponse à l’utilisateur
            const stream = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder()
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: 'full',
                        content: response.output_text,
                    }) + '\n'))
                    controller.close()
                }
            })

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            })
        }

        const agent = await createLangChainAgent(workspace)
        const result = await agent.invoke({ input: message })

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder()
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'full',
                    content: result.output,
                }) + '\n'))
                controller.close()
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        })
    } catch (err: any) {
        console.error('❌ Erreur traitement assistant :', err)

        // Gestion d’erreur avec un flux d’erreur formaté
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder()
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'error',
                    content: err.message || 'Erreur inconnue',
                }) + '\n'))
                controller.close()
            }
        })

        return new Response(stream, {
            status: 500,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        })
    }
}
