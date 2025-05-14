import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

import { functionsDefinition } from '../functions/functionsDefinition'
import { handleToolCall } from '../helpers/toolHandler'
import { Assistant } from '../models/assistant'

export const createLangChainAgent = async (workspace: string, assistant?: Assistant) => {
    const model = new ChatOpenAI({
        modelName: assistant?.model ?? "gpt-4",
        temperature: 0,
        streaming: false,
    });

    const tools = functionsDefinition.map((fn) => {
        return new DynamicStructuredTool({
            name: fn.function.name,
            description: fn.function.description,
            schema: fn.function.parameters as any,
            func: async (args) => {
                console.debug('🛠️ [LangChainAgent] Fonction GPT appelée :', fn.function.name, args);

                const result = await handleToolCall(fn.function.name, JSON.stringify(args), workspace);

                return JSON.stringify({
                    data: result.items?.data ?? result.data ?? [],
                    link: result.link,
                });
            },
        });
    });

    const executor = await initializeAgentExecutorWithOptions(tools as any, model, {
        agentType: "openai-functions" as any,
        verbose: true,
        agentArgs: {
            systemMessage: "Tu es un assistant DIJI. Planifie les actions nécessaires et appelle les fonctions via LangChain.",
        },
    });

    return executor;
};
