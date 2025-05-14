import { StreamApiHelper } from '../../helpers/api/streamApiHelper'
import { Assistant } from '../../models/assistant'

export const StreamService = {
    startStreamingResponse: async (
        message: string,
        onToken: (token: string) => void,
        workspace: string,
        module: string,
        onFunctionCall?: (name: string, args: string) => void,
        assistant?: Assistant
    ): Promise<{ content: string; link: string }> => {
        const reader = await StreamApiHelper.streamMessageToAssistant(message, workspace, module, assistant);
        const decoder = new TextDecoder();
        let fullResponse = '';
        let finalLink = ''

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(Boolean);

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);

                    if (parsed.type === "token") {
                        fullResponse += parsed.token;
                        onToken(parsed.token);
                    }

                    if (parsed.type === "full") {
                        fullResponse += parsed.content;
                        onToken(parsed.content);
                        if (parsed.link) finalLink = parsed.link

                    }

                    if (parsed.type === "tool_call" && onFunctionCall) {
                        onFunctionCall(parsed.function.name, parsed.function.arguments);
                    }
                } catch (e) {
                    console.warn("⚠️ Erreur parsing JSON ligne stream :", line, e);
                }
            }
        }


        return { content: fullResponse, link: finalLink };
    }
};
