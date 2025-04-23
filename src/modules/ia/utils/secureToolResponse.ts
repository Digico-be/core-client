const MAX_ITEMS = parseInt(process.env.OPENAI_TOOL_OUTPUT_MAX_ITEMS || "10");

/**
 * Limite dynamiquement la taille d’un output avant de l’envoyer à OpenAI
 */
export const secureToolResponse = (data: any): {
    truncated: boolean,
    totalItems?: number,
    returnedItems?: number,
    result: any[]
} => {
    let truncated = false;
    let totalItems = 0;
    let returnedItems = 0;

    const truncateArray = (arr: any[]) => {
        totalItems = arr.length;
        if (arr.length > MAX_ITEMS) {
            truncated = true;
            returnedItems = MAX_ITEMS;
            return arr.slice(0, MAX_ITEMS);
        }
        returnedItems = arr.length;
        return arr;
    };

    const process = (obj: any): any[] => {
        // Laravel pagination classique
        if (obj?.data && Array.isArray(obj.data)) {
            return truncateArray(obj.data);
        }

        // Structure personnalisée : items[]
        if (obj?.items && Array.isArray(obj.items)) {
            return truncateArray(obj.items);
        }

        // Structure imbriquée : items.data
        if (obj?.items?.data && Array.isArray(obj.items.data)) {
            return truncateArray(obj.items.data);
        }

        // Direct array
        if (Array.isArray(obj)) {
            return truncateArray(obj);
        }

        return [];
    };

    const result = process(data);

    return {
        result,
        truncated,
        ...(truncated ? { totalItems, returnedItems } : {}),
    };
};
