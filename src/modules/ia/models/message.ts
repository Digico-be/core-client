import { Attachment } from './attachment';

/** Message échangé dans un thread OpenAI */
export interface Message {
    id: string;                       // message_openai_id
    content: string;
    sender: 'user' | 'assistant';
    timestamp?: string | null;
    threadId?: string;

    /** Pièces jointes éventuelles */
    attachments?: Attachment[];
}
