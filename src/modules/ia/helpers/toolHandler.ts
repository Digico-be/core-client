import { functionsDefinition } from '../functions/functionsDefinition'

import { fetchLaravelData } from './fetchLaravelData'


/**
 * Résout dynamiquement une fonction GPT à partir de sa définition et appelle Laravel
 */
export const handleToolCall = async (
    functionName: string,
    rawArgs: string,
    workspace: string
): Promise<any> => {
    const args = JSON.parse(rawArgs);

    console.debug("🔍 [handleToolCall] Appel de fonction :", functionName);
    console.debug("📦 [handleToolCall] Arguments bruts :", args);

    const found = functionsDefinition.find(
        (fn) => fn.function.name === functionName
    );

    if (!found) {
        throw new Error(`Fonction "${functionName}" non trouvée dans functionsDefinition.`);
    }

    let endpoint = found.function.parameters?.properties?.endpoint?.default;

    if (!endpoint) {
        throw new Error(`Aucun endpoint par défaut défini pour "${functionName}".`);
    }

    // Remplacer les {id} ou autres dans l'URL par les valeurs d’arguments
    Object.entries(args).forEach(([key, value]) => {
        if (typeof value === "string") {
            endpoint = endpoint.replace(`{${key}}`, value);
        }
    });

    console.debug("🔗 [handleToolCall] Endpoint final appelé :", endpoint);

    return await fetchLaravelData(endpoint, workspace);
};
