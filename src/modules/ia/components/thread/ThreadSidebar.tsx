import { v4 as uuidv4 } from 'uuid'

import { useThreadTabs } from '../../hooks/useThreadTabs'

interface ThreadSidebarProps {
    tabId: string
}

export const ThreadSidebar: React.FC<ThreadSidebarProps> = ({ tabId }) => {
    const {
        threads,
        activeThreadId,
        setActiveThreadId,
        addThread,
        removeThread
    } = useThreadTabs(tabId)

    return (
        <div className="flex flex-col h-full p-4 gap-2 bg-white mr-2">
            <h2 className="text-lg font-semibold mb-2">Conversations</h2>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
                {threads.map(threadId => (
                    <div
                        key={threadId}
                        className={`px-3 py-2 rounded cursor-pointer text-sm flex justify-between items-center ${
                            activeThreadId === threadId ? 'bg-white font-bold shadow' : 'hover:bg-gray-200'
                        }`}
                        onClick={() => setActiveThreadId(threadId)}
                    >
                        <span>Thread {threadId.slice(0, 4)}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                removeThread(threadId)
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <button
                className="mt-4 bg-primary text-white text-sm px-3 py-2 rounded hover:bg-blue-600"
                onClick={() => addThread(uuidv4())}
            >Nouvelle conversation
            </button>
        </div>
    )
}
