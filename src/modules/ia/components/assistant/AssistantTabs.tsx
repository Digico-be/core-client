'use client'

import React, {useEffect, useRef, useState} from 'react'
import { useRouterWithTenant } from '@digico/utils'
import { v4 as uuidv4 } from 'uuid'

import { destroyAssistant } from '../../services/assistant'
import { AssistantService } from '../../services/OpenAi/assistantService'
import { useAssistantTabs } from '../../hooks/useAssistantTabs'

import { AssistantTab } from '../../models/assistantTab'
import { SessionStorage } from '../../utils/sessions'

import AssistantTabContent from './AssistantTabContent'



interface AssistantTabsProps {
    type: 'general' | 'specialized'
}

const AssistantTabs: React.FC<AssistantTabsProps> = ({ type }) => {
    const { tabs, setTabs, activeTabId, setActiveTabId } = useAssistantTabs(type)

    const containerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    const scrollInterval = useRef<NodeJS.Timeout | null>(null)
    const prevActiveTabId = useRef<string | null>(null)
    const centerTimeout = useRef<NodeJS.Timeout | null>(null)
    const router = useRouterWithTenant()

    const startContinuousScroll = (direction: 'left' | 'right') => {
        const el = containerRef.current
        if (!el) return

        let speed = 10               // vitesse initiale
        const maxSpeed = 80            // vitesse max plus élevée
        const acceleration = 1.2       // accélération plus rapide

        scrollInterval.current = setInterval(() => {
            el.scrollBy({ left: direction === 'left' ? -speed : speed, behavior: 'auto' })
            speed = Math.min(speed * acceleration, maxSpeed)
        }, 16)
    }

    const stopContinuousScroll = () => {
        if (scrollInterval.current) {
            clearInterval(scrollInterval.current)
            scrollInterval.current = null
        }
    }

    const checkScroll = () => {
        const el = containerRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handle = () => checkScroll()

        el.addEventListener('scroll', handle)
        window.addEventListener('resize', handle)

        setTimeout(() => {
            checkScroll()
        }, 50)

        return () => {
            el.removeEventListener('scroll', handle)
            window.removeEventListener('resize', handle)
        }
    }, [tabs, activeTabId])

    const addTab = () => {
        const moduleName =
            type === 'general'
                ? 'general'
                : prompt('Nom du module spécialisé ?')?.trim()

        if (!moduleName) return

        const id = uuidv4()
        const title =
            type === 'general'
                ? `Assistant Général ${tabs.filter(t => t.type === 'general').length + 1}`
                : `Module: ${moduleName}`

        const newTab: AssistantTab = {
            id,
            module: moduleName,
            title,
            type,
        }

        setTabs(prev => [...prev, newTab])
        setActiveTabId(id)
    }

    const closeTab = async (id: string) => {
        const assistantId = SessionStorage.getAssistantOpenAiIdForTab(id)

        if (assistantId) {
            try {
                // Supprimer OpenAI
                await AssistantService.deleteAssistant(assistantId);

                // Supprimer DB Laravel
                await destroyAssistant(assistantId);
            } catch (err) {
                console.error('Erreur suppression assistant :', err)
            }

            SessionStorage.removeAssistantOpenAiIdForTab(id)
        }

        const remaining = tabs.filter(tab => tab.id !== id)
        setTabs(remaining)
        if (id === activeTabId) {
            setActiveTabId(remaining[0]?.id || null)
        }
    }

    const renderTabContent = () => {
        const active = tabs.find(t => t.id === activeTabId)
        if (!active) return <p className="text-center text-gray-500 mt-8">Aucun assistant ouvert</p>

        return (
            <AssistantTabContent
                key={active.id}
                tabId={active.id}
                module={active.module}
                type={active.type}
            />
        )
    }

    useEffect(() => {
        if (tabs.length === 0 && type) {
            addTab()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // on ignore tabs ici pour éviter les doublons


    return (
        <>
            <div className="flex items-center bg-white mb-2">
                {/* Flèche gauche */}
                {canScrollLeft && (
                    <button
                        onMouseDown={() => startContinuousScroll('left')}
                        onMouseUp={stopContinuousScroll}
                        onMouseLeave={stopContinuousScroll}
                        onTouchStart={() => startContinuousScroll('left')}
                        onTouchEnd={stopContinuousScroll}
                        className="px-2 py-2"
                    >
                        ◀
                    </button>
                )}

                {/* Tabs container */}
                <div
                    id="tab-scroll-container"
                    ref={containerRef}
                    className="overflow-x-auto flex-1 pr-4 scroll-smooth scrollbar-hide"
                >
                    <div className="flex gap-2 min-w-fit">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                ref={(el) => {
                                    if (
                                        el &&
                                        tab.id === activeTabId &&
                                        containerRef.current &&
                                        activeTabId !== prevActiveTabId.current
                                    ) {
                                        const container = containerRef.current
                                        const elLeft = el.offsetLeft
                                        const elRight = el.offsetLeft + el.offsetWidth
                                        const visibleLeft = container.scrollLeft
                                        const visibleRight = container.scrollLeft + container.clientWidth

                                        const isPartiallyHidden = elLeft < visibleLeft || elRight > visibleRight

                                        if (isPartiallyHidden) {
                                            el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
                                        }

                                        // Centrer après 2 secondes
                                        if (centerTimeout.current) clearTimeout(centerTimeout.current)

                                        centerTimeout.current = setTimeout(() => {
                                            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                                        }, 2000)


                                        prevActiveTabId.current = activeTabId
                                    }
                                }}



                                className={`px-4 py-4 rounded-t-lg cursor-pointer whitespace-nowrap ${
                                    tab.id === activeTabId ? 'bg-white font-bold' : 'bg-gray-400'
                                }`}
                                onClick={() => setActiveTabId(tab.id)}
                            >

                                {tab.title}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        closeTab(tab.id)
                                    }}
                                    className="ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flèche droite */}
                {canScrollRight && (
                    <button
                        onMouseDown={() => startContinuousScroll('right')}
                        onMouseUp={stopContinuousScroll}
                        onMouseLeave={stopContinuousScroll}
                        onTouchStart={() => startContinuousScroll('right')}
                        onTouchEnd={stopContinuousScroll}
                        className="px-2 py-2"
                    >
                        ▶
                    </button>
                )}

                {/* Ajout de tab */}
                <div className="ml-4 flex gap-2">
                    <button
                        onClick={addTab}
                        className="bg-primary text-white px-4 py-2 rounded text-sm"
                    >
                        Créer un assistant
                    </button>
                    <button onClick={() => router.push('/ia/setting')} className="bg-primary text-white px-4 py-2 rounded text-sm"
                    >
                        Voir les réglages
                    </button>


                </div>
            </div>

            {renderTabContent()}
        </>
    )
}

export default AssistantTabs
