import {
    createThread,
    deleteMessagesFromThread,
    editMessageInThread,
    getMessagesFromThread,
    sendStructuredMessageToThread,
} from '../../helpers/api/threadApiHelper';
import { ThreadMessageContent } from '../../models/thread';
import { sanitizeThreadContent } from '../../utils/threadUtils';

export class ThreadService {
    static async createThread(assistantId: string, module?: string): Promise<any> {
        return await createThread(assistantId, module);
    }

    static async sendMessageToThread(
        threadId: string,
        content: ThreadMessageContent[],
        role: 'user' | 'assistant' = 'user',
        /** ⬅️ 1) le type est maintenant string[] */
        attachments?: string[],
    ): Promise<any> {
        const hasFile = Array.isArray(attachments) && attachments.length > 0;
        const sanitized = sanitizeThreadContent(content);

        // Cas bloquant : aucun texte et aucun fichier
        if (sanitized.length === 0 && !hasFile) {
            // S'il s'agit d'une réponse assistant suite à un tool_call, ne pas bloquer
            const isToolCallResponse = role === 'assistant' && content.length === 0;
            if (!isToolCallResponse) {
                throw new Error("Impossible d’envoyer un message vide");
            }
        }

        const finalContent: Array<{ type: 'text'; text: string }> =
            sanitized.length > 0 ? sanitized : [{ type: 'text', text: '📎 Fichier joint' }];

        /** ⬅️ 2) on passe le string[] directement */
        return await sendStructuredMessageToThread({
            threadId,
            content: finalContent,
            attachments,
            role,
        });
    }

    static async getMessagesFromThread(threadId: string): Promise<any[]> {
        const reponse = await getMessagesFromThread(threadId);
        console.log('📨 Réponse brute API Laravel getMessages:', reponse);
        return reponse;
    }

    static async deleteMessagesFromThread(threadId: string, messageIds: string[]): Promise<void> {
        return await deleteMessagesFromThread(threadId, messageIds);
    }

    static async editMessage(threadId: string, messageId: string, newContent: string): Promise<any> {
        return await editMessageInThread(threadId, messageId, newContent);
    }
}
