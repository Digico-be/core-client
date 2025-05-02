'use client';

import React from 'react';

import { useThreadTabsContext } from '../../hooks/useThreadTabsContext';

export const ThreadSidebar: React.FC = () => {
    const {
        threads,
        activeThreadId,
        setActiveThreadId,
        addThread,
        removeThread,
    } = useThreadTabsContext();

    return (
        <div className="flex flex-col h-full p-4 gap-2 bg-white mr-2">
            <h2 className="text-lg font-semibold mb-2">Conversations</h2>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
                {threads.map((id: string) => (
                    <div
                        key={id}
                        onClick={() => setActiveThreadId(id)}
                        className={`px-3 py-2 rounded cursor-pointer text-sm flex justify-between items-center ${
                            activeThreadId === id ? 'bg-white font-bold shadow' : 'hover:bg-gray-200'
                        }`}
                    >
                        <span>Thread {id.slice(0, 4)}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeThread(id);
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
                onClick={addThread}
            >
                Nouvelle conversation
            </button>
        </div>
    );
};
