export const createRun = async (threadId: string, assistantId: string, options?: {
    instructions?: string;
    model?: string;
    metadata?: Record<string, string>;
}) => {
    try {
        const response = await fetch(`/api/runs/${threadId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assistant_id: assistantId,
                ...options,
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création du run');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur dans createRun:', error);
        throw error;
    }
};

export const getRunStatus = async (threadId: string, runId: string) => {
    const response = await fetch(`/api/runs/${threadId}/${runId}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération du statut du run');
    return await response.json();
};

export const cancelRun = async (threadId: string, runId: string) => {
    try {
        const response = await fetch(`/api/runs/${threadId}/${runId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l’annulation du run');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur dans cancelRun:', error);
        throw error;
    }
};
