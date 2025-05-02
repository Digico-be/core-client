import { Thread } from '../../models/thread'

import { HttpService } from './index'

type LaravelThreadResponse = {
    data: {
        openai_id: string;
        assistant_openai_id: string;
        module?: string;
        created_at: string;
    };
};

export const createThread = async (
    openaiThreadId: string,
    assistantOpenAiId: string,
    module?: string
): Promise<Thread> => {
    const payload = {
        openai_id: openaiThreadId,
        assistant_openai_id: assistantOpenAiId,
        module,
        created_at: new Date().toISOString(),
    };

    const res = await HttpService.post<LaravelThreadResponse>('/', payload);

    const t = 'data' in res ? res.data : (res as any);   // ← fonctionne pour les 2 formats

    return {
        id: t.openai_id,
        assistantId: t.assistant_openai_id,
        module: t.module,
        createdAt: t.created_at,
    };
};


