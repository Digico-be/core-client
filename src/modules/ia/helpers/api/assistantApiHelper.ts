import { Assistant } from '../../models/assistant'

/**
 * Crée un assistant via l'API OpenAI.
 * @param assistant L'assistant à créer
 * @returns L'assistant créé avec son ID.
 */
export const createAssistant = async (assistant: {
    name: string;
    module: string;
    description: string;
    instructions?: string;
    model?: string;
    tools?: any[];
}) => {
    try {
        const response = await fetch('/api/assistants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assistant),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de l\'assistant');
        }

        const data = await response.json();

        if (!data?.id) {
            console.error('[createAssistant] Erreur : ID manquant dans la réponse de l’API', data)
            throw new Error("Assistant OpenAI créé, mais sans ID.")
        }

        return data;
    } catch (error) {
        console.error('Erreur lors de la création de l\'assistant:', error);
        throw new Error('Erreur lors de la création de l\'assistant');
    }
};

/**
 * Récupère un assistant via l'API OpenAI.
 * @param assistantId L'ID de l'assistant à récupérer
 * @returns L'assistant récupéré
 */
export const getAssistantById = async (assistantId: string) => {
    try {
        const response = await fetch(`/api/assistants/${assistantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de l'assistant ${assistantId}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'assistant:', error);
        throw new Error('Erreur lors de la récupération de l\'assistant');
    }
};

/**
 * Supprime un assistant via l'API OpenAI en appelant une route backend.
 * @param assistantId L'ID de l'assistant à supprimer
 * @returns Statut de la suppression
 */
export const deleteAssistant = async (assistantId: string) => {
    try {
        const response = await fetch(`/api/assistants/${assistantId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'assistant');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'assistant:', error);
        throw new Error('Erreur lors de la suppression de l\'assistant');
    }
};

export const patchAssistantOpenAI = async (
    assistantId: string,
    payload: Partial<Assistant>
) => {
    try {
        const res = await fetch(`/api/assistants/${assistantId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('Erreur update OpenAI')

        return await res.json()
    } catch (e) {
        console.error('[patchAssistantOpenAI]', e)
        throw e
    }
}