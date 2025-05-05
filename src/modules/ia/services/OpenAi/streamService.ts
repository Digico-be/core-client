import { StreamApiHelper } from '../../helpers/api/streamApiHelper'

export const StreamService = {
    startStreamingResponse: async (
        message: string,
        onToken: (token: string) => void,
        workspace: string,
        onFunctionCall?: (name: string, args: string) => void
    ): Promise<string> => {
        const reader = await StreamApiHelper.streamMessageToAssistant(message, workspace);
        const decoder = new TextDecoder();
        let fullResponse = '';

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
                    }

                    if (parsed.type === "tool_call" && onFunctionCall) {
                        onFunctionCall(parsed.function.name, parsed.function.arguments);
                    }
                } catch (e) {
                    console.warn("⚠️ Erreur parsing JSON ligne stream :", line, e);
                }
            }
        }


        return fullResponse;
    }
};
