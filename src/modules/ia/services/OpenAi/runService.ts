import { cancelRun,createRun, getRunStatus } from '../../helpers/api/runApiHelper';

export class RunService {
    /**
     * Crée un run (exécution) pour un assistant sur un thread donné
     */
    static async startRun(
        threadId: string,
        assistantId: string,
        options?: {
            instructions?: string;
            model?: string;
            metadata?: Record<string, string>;
        }
    ): Promise<any> {
        console.log("Démarrage d’un run pour le thread:", threadId);
        console.log("Assistant ID:", assistantId);

        return await createRun(threadId, assistantId, options);
    }

    /**
     * Récupère l'état actuel d'un run (statut, infos, etc.)
     */
    static async getStatus(threadId: string, runId: string): Promise<any> {
        return await getRunStatus(threadId, runId);
    }

    static async cancelRun(threadId: string, runId: string): Promise<any> {
        return await cancelRun(threadId, runId);
    }
}
