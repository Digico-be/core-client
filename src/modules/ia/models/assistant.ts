/**
 * Interface représentant un Assistant dans l'application.
 * Les assistants sont des entités qui utilisent des modèles AI d'OpenAI
 * pour exécuter des tâches spécifiques, souvent en fonction du module auquel ils sont associés.
 */
export interface Assistant {
    /**
     * Identifiant unique de l'assistant.
     */
    openai_id: string

    /**
     * Nom de l'assistant.
     * Exemple : 'Billing Assistant', 'General Assistant', etc.
     */
    name: string

    /**
     * Description de l'assistant.
     * Une courte explication de son rôle et de ses fonctionnalités.
     */
    description: string

    /**
     * Le module auquel l'assistant est associé.
     * Exemple : 'billing', 'contact', 'team', etc.
     */
    module: string

    /**
     * Instructions spécifiques à l'assistant.
     * Utilisées pour personnaliser son comportement et sa personnalité.
     * Ces instructions permettent de spécifier le ton, le style, et les priorités dans ses réponses.
     * Limite : 256 000 caractères.
     */
    instructions?: string

    /**
     * Modèle AI utilisé par l'assistant.
     * Exemple : 'gpt-3.5-turbo', 'gpt-4', etc.
     * Cela permet de spécifier quel modèle OpenAI l'assistant doit utiliser pour générer ses réponses.
     */
    model?: string

    /**
     * Liste des outils que l'assistant peut utiliser pendant les sessions.
     * Exemple : code_interpreter, file_search, etc.
     * Ces outils enrichissent les capacités de l'assistant, en lui permettant d'effectuer des tâches plus complexes.
     */
    tools?: Array<{ type: string; [key: string]: any }>

    /**
     * Liste d'identifiants de fichiers auxquels l'assistant a accès.
     * Ces fichiers peuvent contenir des informations ou des documents que l'assistant peut consulter pour répondre à l'utilisateur.
     */
    file_ids?: string[]

    /**
     * Métadonnées associées à l'assistant.
     * Un ensemble de paires clé-valeur permettant de stocker des informations supplémentaires.
     * Par exemple, des informations de configuration ou d'intégration avec d'autres systèmes.
     */
    metadata?: Record<string, string>

    /**
     * Type d'assistant.
     * Peut être 'general' pour un assistant généraliste ou 'specialized' pour un assistant spécialisé dans un domaine particulier.
     */
    type: 'general' | 'specialized'

    /**
     * Température utilisée pour la génération de texte.
     * Un paramètre qui influence la créativité et la variabilité des réponses de l'assistant.
     * Une température plus élevée (ex: 0.8) rend les réponses plus variées, tandis qu'une température plus basse (ex: 0.2) les rend plus prévisibles.
     */
    temperature?: number

    /**
     * Nombre maximum de tokens que l'assistant peut générer dans ses réponses.
     */
    max_tokens_output?: number

    /**
     * Liste de règles que l'assistant doit suivre.
     */
    rules?: string[]

    /**
     * Persona de l'assistant.
     * Une description de la personnalité ou du caractère de l'assistant.
     */
    persona?: string

    /**
     * Liste de prompts suggérés pour guider l'utilisateur dans ses interactions avec l'assistant.
     */
    suggested_prompts?: string[]
}
