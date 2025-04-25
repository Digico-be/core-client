import { Thread } from '../../models/thread'

import { HttpService } from './index'

type LaravelThread = {
    openai_id: string;
    assistant_openai_id: string;
    module?: string;
    created_at: string;
};

export const createThread = async (
    openaiThreadId: string,
    assistantOpenAiId: string,
    module?: string,
): Promise<Thread> => {
    const payload = {
        openai_id: openaiThreadId,
        assistant_openai_id: assistantOpenAiId,
        module,
        created_at: new Date().toISOString(),
    };

    const response = await HttpService.post<LaravelThread>('/', payload);

    return {
        id: response.openai_id,
        assistantId: response.assistant_openai_id,
        module: response.module,
        createdAt: response.created_at,
    };
};

