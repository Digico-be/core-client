import { functionsDefinition } from '../../functions/functionsDefinition'
import { createAssistant, deleteAssistant, getAssistantById } from '../../helpers/api/assistantApiHelper'
import { Assistant } from '../../models/assistant'


/**
 * Service de gestion des assistants.
 * Permet de créer un assistant spécifique pour un module donné via l'API OpenAI.
 */
export class AssistantService {
    /**
     * Crée un assistant spécifique pour un module donné.
     * @param module Le nom du module (ex: 'billing', 'contact')
     * @returns L'assistant créé.
     */
    static async createAssistant(module: string): Promise<{ id: string; name: string; description?: string; model?: string; instructions?: string; tools?: any[] }> {
        const assistantOpenAi = await createAssistant({
            name: `${module.charAt(0).toUpperCase() + module.slice(1)} Assistant`,
            description: `Assistant spécialisé pour le module ${module}`,
            module,
            model: 'gpt-4.1-2025-04-14',
            instructions: `L'assistant est conçu pour répondre aux questions liées au module ${module}.`,
            tools: [...functionsDefinition, { type: 'file_search' }]
        })

        if (!assistantOpenAi?.id) {
            throw new Error("Échec de la création OpenAI : id manquant")
        }

        return assistantOpenAi
    }

    /**
     * Récupère un assistant existant par son ID.
     * @param assistantId L'ID de l'assistant
     * @returns Les détails de l'assistant
     */
    static async getAssistantById(assistantId: string): Promise<Assistant> {
        return await getAssistantById(assistantId)
    }

    /**
     * Supprime un assistant spécifique.
     * @param assistantId L'ID de l'assistant à supprimer
     * @returns Le statut de la suppression.
     */
    static async deleteAssistant(assistantId: string): Promise<any> {
        return await deleteAssistant(assistantId)
    }
}
