/**
 * Interface représentant un message dans un thread.
 * Un message fait partie d'une conversation et contient du contenu échangé entre un utilisateur et l'assistant.
 */
export interface Message {
    /**
     * Identifiant unique du message.
     * Utilisé pour identifier de manière unique chaque message dans le thread.
     */
    id: string;

    /**
     * Contenu du message.
     * Texte ou données envoyées par l'expéditeur du message, qui peuvent être des questions, des réponses ou des instructions.
     */
    content: string;

    /**
     * Expéditeur du message.
     * Peut être 'user' si l'utilisateur a envoyé le message, ou 'assistant' si l'assistant l'a envoyé.
     */
    sender: 'user' | 'assistant';

    /**
     * Horodatage du message.
     * Indique le moment où le message a été envoyé ou reçu.
     * Format : ISO 8601 (ex. : '2025-04-10T10:05:00Z').
     */
    timestamp?: string | null

    /**
     * Identifiant du thread auquel ce message appartient.
     * Utilisé pour associer le message au thread correct.
     */
    threadId?: string;

    type?: 'text' | 'file';
    file?: {
        file_id: string;
        filename?: string;
    };
}
