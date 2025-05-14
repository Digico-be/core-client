import { Assistant } from '../../models/assistant'

export const StreamApiHelper = {
    streamMessageToAssistant: async (message: string, workspace: string, module: string, assistant?: Assistant): Promise<ReadableStreamDefaultReader <Uint8Array>> => {
        const res = await fetch("/api/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, workspace, module, assistant }),
        });

        if (!res.ok || !res.body) {
            throw new Error("Erreur lors de la récupération du flux.");
        }

        return res.body.getReader();
    },
};
