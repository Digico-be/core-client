'use client'

import { usePathname } from 'next/navigation'

import React, { useState } from 'react'

import AssistantBase from '../assistant/AssistantBase'

const AssistantWindow: React.FC = () => {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Module déterminé
    const moduleType = 'specialized'
    const tabId = 'floating-window-general'

    // Liste des routes où l'assistant ne doit pas s'afficher
    const excludedPaths = ['/codevo', '/codevo/ia']

    // Si on est sur une route exclue, on ne rend rien
    if (excludedPaths.includes(pathname)) {
        return null
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50"
            >
                {isOpen ? 'Fermer Assistant' : '💬 Assistant'}
            </button>

            {isOpen && (
                <div className="fixed bottom-20 right-6 w-[400px] h-[600px] bg-white border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col px-2">
                    <AssistantBase tabId={tabId} module={moduleType} />
                </div>
            )}
        </>
    )
}

export default AssistantWindow
