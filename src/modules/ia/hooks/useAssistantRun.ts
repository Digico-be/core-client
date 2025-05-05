import { useCallback } from 'react'

import { RunService } from '../services/OpenAi/runService'
import { ThreadService } from '../services/OpenAi/threadService'

import { Message } from '../models/message'

type Callback = (msg: Message) => void

export function useAssistantRun(
    assistantId: string,
    addThinking: () => void,
    removeThinking: () => void,
    pushMessage: Callback
) {
    const runWithFiles = useCallback(
        async (threadId: string) => {
            addThinking()

            try {
                const run = await RunService.startRun(threadId, assistantId)

                const poll = setInterval(async () => {
                    const status = await RunService.getStatus(threadId, run.id)

                    if (status.status === 'completed' || status.status === 'failed') {
                        clearInterval(poll)
                        removeThinking()

                        if (status.status === 'completed') {
                            const all = await ThreadService.getMessagesFromThread(threadId)
                            const msg = all.find(m => m.role === 'assistant')
                            if (msg) {
                                pushMessage({
                                    id: msg.id,
                                    sender: 'assistant',
                                    content: msg.content[0]?.text?.value || '',
                                    timestamp: new Date(msg.created_at * 1000).toISOString(),
                                    threadId
                                })
                            }
                        } else {
                            pushMessage({
                                id: crypto.randomUUID(),
                                sender: 'assistant',
                                content: '❌ Erreur lors du traitement du fichier.',
                                timestamp: new Date().toISOString(),
                                threadId
                            })
                        }
                    }
                }, 2000)
            } catch {
                removeThinking()
            }
        },
        [assistantId, addThinking, removeThinking, pushMessage]
    )

    return { runWithFiles }
}
