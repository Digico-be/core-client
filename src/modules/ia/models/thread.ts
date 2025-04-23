/**
 * Interface représentant un thread dans l'application.
 * Un thread est une conversation entre l'utilisateur et l'assistant, souvent associée à un module spécifique.
 * Il contient des informations sur l'assistant, le module lié, ainsi que les messages échangés.
 */
export interface Thread {
    /**
     * Identifiant unique du thread.
     * Utilisé pour référencer de manière unique chaque conversation dans l'application.
     */
    id: string;

    /**
     * Identifiant unique de l'assistant.
     * Permet de savoir quel assistant est associé à ce thread pour fournir les réponses.
     */
    assistantId: string;

    /**
     * Le module auquel ce thread est lié.
     * Exemple : 'billing' pour un thread de facturation, 'contacts' pour un thread de gestion des contacts, etc.
     */
    module?: string;

    /**
     * Date de création du thread.
     * Représente le moment où le thread a été initialisé.
     * Format : ISO 8601 (ex. : '2025-04-10T10:00:00Z').
     */
    createdAt: string;
}

/**
 * Type des contenus d'un message envoyé dans un thread (texte ou fichier).
 */
export type ThreadMessageContent =
    | { type: 'text'; text: string }
    | { type: 'file'; file: { file_id: string } };