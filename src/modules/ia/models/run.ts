/**
 * Interface représentant une exécution (run) d’un assistant dans un thread.
 * Un run correspond à une tentative de l’assistant de répondre à un message utilisateur
 * en suivant les instructions définies et en utilisant le modèle spécifié.
 */
export interface Run {
    /**
     * Identifiant unique du run.
     * Généré lors de la création d’un run via l’API OpenAI.
     */
    id: string;

    /**
     * Identifiant du thread auquel ce run appartient.
     * Un thread regroupe une conversation continue entre l’utilisateur et l’assistant.
     */
    thread_id: string;

    /**
     * Identifiant de l’assistant utilisé pour ce run.
     * Permet de savoir quel assistant a généré les réponses.
     */
    assistant_id: string;

    /**
     * Statut actuel du run.
     * Exemple : 'queued', 'in_progress', 'completed', 'failed', etc.
     * Ce champ permet de suivre l’état d’avancement de l’exécution.
     */
    status: string;

    /**
     * Timestamp de création du run (en secondes depuis l’époque Unix).
     * Permet de connaître la date et l’heure de lancement du run.
     */
    created_at: number;

    /**
     * Modèle AI utilisé pour le run.
     * Exemple : 'gpt-4', 'gpt-3.5-turbo', etc.
     * Ce champ est utile si le modèle est précisé au moment de la création du run.
     */
    model?: string;

    /**
     * Instructions spécifiques utilisées pour ce run.
     * Elles peuvent modifier le comportement de l’assistant pour cette exécution particulière.
     * Si non renseigné, les instructions de l’assistant sont utilisées.
     */
    instructions?: string;

    /**
     * Métadonnées personnalisées associées au run.
     * Il s’agit de paires clé-valeur pouvant contenir des informations de suivi, de configuration ou de contexte.
     */
    metadata?: Record<string, string>;
}
