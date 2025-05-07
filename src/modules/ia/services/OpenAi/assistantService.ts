import { functionsDefinition } from '../../functions/functionsDefinition'
import {
    createAssistant,
    deleteAssistant,
    getAssistantById,
    patchAssistantOpenAI
} from '../../helpers/api/assistantApiHelper'
import { Assistant } from '../../models/assistant'

function clean(obj: Record<string, any>, allowed: readonly string[]) {
    return Object.fromEntries(
        allowed
            .filter(k => obj[k] != null && !(Array.isArray(obj[k]) && obj[k].length === 0))
            .map(k => [k, obj[k]])
    );
}

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

    /**
     * Met à jour un assistant spécifique.
     * @param assistantId
     * @param data
     */
    static async updateAssistant(id: string, data: Partial<Assistant>) {
        // 🧹 nettoie avant l’appel fetch
        const allowed = ['name','description','instructions','model','tools','file_ids','metadata'] as const;
        const payload = clean(data, allowed);
        return patchAssistantOpenAI(id, payload);
    }
}
