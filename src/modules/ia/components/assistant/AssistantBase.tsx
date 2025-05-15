'use client'

import React, { useEffect } from 'react'
import { useAuth, useRouterWithTenant } from '@digico/utils'

import { useAssistant } from '../../hooks/useAssistant'
import { useChatThread } from '../../hooks/useChatThread'
import { useThreadTabsContext } from '../../hooks/useThreadTabsContext'

import { Icon } from '@components/Icon'

import MessageInput from '../message/MessageInput'

interface Props {
    module: string
    tabId: string
    type: 'general' | 'specialized' | 'radar'
}

const AssistantBase: React.FC<Props> = ({ module, tabId, type }) => {
    const { data: assistant, isError, error } = useAssistant(module, tabId, type)
    const { activeThreadId, threads, addThread, isLoading: threadsLoading } = useThreadTabsContext()
    const { tenant } = useAuth()
    const router = useRouterWithTenant()

    const initialThreadId = activeThreadId || undefined

    const {
        messages,
        streamedResponse,
        sendMessage,
        deleteMessage,
        editMessage,
        thread,
    } = useChatThread(
        tabId,
        assistant?.openai_id ?? '',
        module,
        tenant?.name ?? '',
        initialThreadId,
        assistant
    )

    useEffect(() => {
        if (!assistant?.openai_id || threadsLoading) return

        if (threads.length === 0) {
            addThread()
        }
    }, [assistant?.openai_id, threads.length, threadsLoading, addThread])

    if (isError) {
        console.error('❌ Erreur de chargement assistant :', error)
        return (
            <p className="p-4 text-center text-red-500">
                {(error as Error)?.message || 'Erreur de chargement'}
            </p>
        )
    }

    if (!assistant) {
        console.log('⌛ Chargement de l’assistant en cours...')
        return <p className="p-4 text-center">Chargement…</p>
    }

    if (!activeThreadId || !thread) {
        return <p className="p-4 text-center">Chargement du thread…</p>
    }

    const toSettings = () => {
        console.log('⚙️ Redirection vers les paramètres de l’assistant')
        router.push(`/ia/setting/${assistant.openai_id}`)
    }

    return (
        <div className="bg-white pt-4 flex flex-col flex-1 overflow-hidden rounded">
            <div className="flex items-center justify-between px-4 mb-2">
                <h1 className="text-2xl font-bold text-center mb-4">
                    {assistant.name}
                </h1>
                <button
                    type="button"
                    onClick={toSettings}
                    className="p-2 rounded hover:bg-gray-100"
                    aria-label="Paramètres de l’assistant"
                >
                    <Icon name="tooth" className="size-8 fill-main" />
                </button>
            </div>
            {/*
            <div className="text-xs text-center mb-6">
                AssistantId:&nbsp;{assistant.openai_id}
                <br />
                ThreadId:&nbsp;{thread.id}
            </div>
            */}
            <MessageInput
                module={module}
                assistantId={assistant.openai_id}
                tabId={tabId}
                messages={messages}
                streamedResponse={streamedResponse}
                sendMessage={(...args) => {
                    return sendMessage(...args)
                }}
                deleteMessage={deleteMessage}
                editMessage={editMessage}
                thread={thread}
                compact={tabId === 'floating-window-general'}
            />
        </div>
    )
}

export default AssistantBase
