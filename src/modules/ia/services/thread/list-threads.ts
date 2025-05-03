import { Thread } from '../../models/thread';

import { HttpService } from './index';

/**
 * Récupère tous les threads d’un assistant donné
 * et normalise la réponse API (openai_id → id, etc.).
 */
export async function listThreads(
    assistantOpenAiId: string,
    module?: string
): Promise<Thread[]> {
    const params = new URLSearchParams({ assistant_openai_id: assistantOpenAiId });
    if (module) params.append('module', module);

    // Réponse brute : { openai_id, assistant_id, module, created_at }
    const raw = await HttpService.get<any[]>(`?${params.toString()}`);

    // ➜ mapping vers notre interface Thread
    return raw.map((t) => ({
        id: t.openai_id,
        assistantId: t.assistant_id,
        module: t.module ?? undefined,
        createdAt: t.created_at,
    })) as Thread[];
}
