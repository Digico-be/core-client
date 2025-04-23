/**
 * Interface représentant un fichier utilisé dans l'application DIJI.
 * Les fichiers peuvent être liés à des messages, des assistants, ou servir de base de connaissance.
 */
export interface IAFile {
    /**
     * Identifiant unique du fichier, généré par l'API OpenAI.
     * Exemple : 'file-abc123xyz'
     */
    id: string;

    /**
     * Nom du fichier tel qu'uploadé par l'utilisateur.
     * Exemple : 'rapport_annuel.pdf'
     */
    filename: string;

    /**
     * Date d’upload du fichier (format ISO).
     */
    uploadedAt: string;

    /**
     * Identifiant de l’assistant auquel le fichier est lié.
     * Peut être un assistant général ou spécialisé.
     */
    assistantId?: string;

    /**
     * Indique si ce fichier a été hérité d’un assistant général.
     * Utile pour les assistants spécialisés qui héritent des fichiers globaux.
     */
    inherited?: boolean;

    /**
     * Type MIME du fichier (ex: 'application/pdf', 'text/csv').
     * Permet de gérer les aperçus et la lecture côté UI.
     */
    mimeType?: string;

    /**
     * Taille du fichier en octets.
     */
    size?: number;

    /**
     * Métadonnées optionnelles (ex: tag, usage prévu, etc.).
     */
    metadata?: Record<string, string>;
}
