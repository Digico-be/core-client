'use client'

import React, { useState } from 'react'

import { Modal } from '@components/dashboard/Modal'

interface Props {
    onCreate: (type: 'general' | 'specialized', module?: string) => void
}

const CreateAssistantModal: React.FC<Props> = ({ onCreate }) => {
    const [type, setType] = useState<'general' | 'specialized'>('general')
    const [module, setModule] = useState('')

    const handleSubmit = (handleClose: () => void) => {
        if (type === 'specialized' && !module.trim()) {
            alert('Veuillez saisir un module.')
            return
        }

        onCreate(type, module.trim())
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
                        <div className="w-full">
                            <label className="font-semibold text-sm">Type d’assistant</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'general' | 'specialized')}
                            >
                                <option value="general">Général</option>
                                <option value="specialized">Spécialisé</option>
                            </select>
                        </div>

                        {type === 'specialized' && (
                            <div className="w-full">
                                <label className="font-semibold text-sm">Nom du module</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="ex: billing"
                                    value={module}
                                    onChange={(e) => setModule(e.target.value)}
                                />
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
