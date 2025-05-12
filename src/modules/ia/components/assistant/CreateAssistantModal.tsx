'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'

import { Modal } from '@components/dashboard/Modal'

import { assistantTemplates } from '../../config/assistantTemplates'


interface Props {
    onCreate: (type: 'general' | 'specialized' | 'radar', module?: string) => void
}

const CreateAssistantModal: React.FC<Props> = ({ onCreate }) => {
    const [type, setType] = useState<'general' | 'specialized' | 'radar'>('general')
    const [module, setModule] = useState('')

    const specializedModules = Object.entries(assistantTemplates.specialized.modules ?? {}).map(
        ([key, val]) => ({
            value: key,
            label: val.name || key,
        }),
    )

    const handleSubmit = (handleClose: () => void) => {
        if (type === 'specialized' && !module.trim()) {
            toast.error('Veuillez sélectionner un module.')
            return
        }

        if (type === 'radar') {
            onCreate('radar', 'radar')
        } else {
            onCreate(type, type === 'general' ? 'general' : module.trim())
        }

        handleClose()
    }

    return (
        <Modal>
            <Modal.Trigger>
                <button className="bg-primary text-white px-4 py-2 rounded text-sm">
                    Créer un assistant
                </button>
            </Modal.Trigger>

            <Modal.Content>
                {({ handleClose }) => (
                    <div className="flex flex-col gap-4">
                        {/* Type */}
                        <div className="w-full">
                            <label className="font-semibold text-sm">Type d’assistant</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={type}
                                onChange={(e) =>
                                    setType(e.target.value as 'general' | 'specialized' | 'radar')
                                }
                            >
                                <option value="general">Général</option>
                                <option value="specialized">Spécialisé</option>
                                <option value="radar">Radar</option>
                            </select>
                        </div>

                        {/* Module (uniquement si spécialisé) */}
                        {type === 'specialized' && (
                            <div className="w-full">
                                <label className="font-semibold text-sm">Module spécialisé</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={module}
                                    onChange={(e) => setModule(e.target.value)}
                                >
                                    <option value="">— Choisir un module —</option>
                                    {specializedModules.map((mod) => (
                                        <option key={mod.value} value={mod.value}>
                                            {mod.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="mt-4">
                            <button
                                className="bg-primary text-white px-4 py-2 rounded text-sm"
                                onClick={() => handleSubmit(handleClose)}
                            >
                                Créer l’assistant
                            </button>
                        </div>
                    </div>
                )}
            </Modal.Content>
        </Modal>
    )
}

export default CreateAssistantModal
