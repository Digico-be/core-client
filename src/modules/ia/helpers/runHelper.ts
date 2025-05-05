import { RunService } from '../services/OpenAi/runService'
import { ThreadService } from '../services/OpenAi/threadService'

import { Message } from '../models/message'


export const waitForRunCompletion = async (
    threadId: string,
    runId: string
): Promise<Message | null> => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const run = await RunService.getStatus(threadId, runId);

        if (run.status === 'cancelled') {
            console.log("⛔ Run annulé, on sort.");
            return null;
        }

        if (run.status === 'completed') {
            const messages = await ThreadService.getMessagesFromThread(threadId);

            const sortedMessages = [...messages].sort((a, b) => a.created_at - b.created_at);
            const lastAssistantMsg = sortedMessages.reverse().find((msg) => msg.role === 'assistant');

            if (!lastAssistantMsg) {
                console.warn('❌ Aucun message assistant trouvé');
                return null;
            }
            
            const content = lastAssistantMsg.content?.[0]?.text?.value;

            if (!content) {
                console.warn('⚠️ Message assistant vide ou mal formaté');
                return null;
            }

            return {
                id: lastAssistantMsg.id,
                content,
                sender: 'assistant',
                timestamp: new Date(lastAssistantMsg.created_at * 1000).toISOString(),
                threadId,
            };
        }

        await new Promise((res) => setTimeout(res, 1000));
        attempts++;
    }

    console.warn("⏳ Run toujours non terminé après plusieurs tentatives");
    return null;
};



