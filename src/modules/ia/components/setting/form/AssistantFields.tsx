'use client'

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { Tooltip } from 'react-tooltip'
import { Form } from '@digico/ui'
import { toast } from 'sonner'

import { Icon } from '@components/Icon'

import 'react-tooltip/dist/react-tooltip.css'

/* Tooltip réutilisable */
const InfoTooltip = ({ id, content }: { id: string; content: string }) => (
    <>
    <span
        data-tooltip-id={id}
        data-tooltip-content={content}
        className="inline-block ml-1 cursor-pointer"
    >
      <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
    </span>
        <Tooltip id={id} place="top" />
    </>
)

/* Types du formulaire */
interface AssistantFormValues {
    name: string
    type: string
    module: string
    model: string
    temperature: number
    max_tokens_output: number
    persona: string
    instructions: string
    rules: { value: string }[]
    suggested_prompts: { value: string }[]
}

export const AssistantFields = () => {
    const form = useFormContext<AssistantFormValues>()

    const { fields: ruleFields, append: appendRule, remove: removeRule } =
        useFieldArray({ control: form.control, name: 'rules' })

    const {
        fields: promptFields,
        append: appendPrompt,
        remove: removePrompt,
    } = useFieldArray({ control: form.control, name: 'suggested_prompts' })

    const usageOptions = [
        { value: 'general', label: 'Général' },
        { value: 'specialized', label: 'Spécialisé' },
    ]

    const moduleOptions = [
        { value: '', label: '— Aucun domaine sélectionné —' },
        { value: 'billing', label: 'Facturation' },
        { value: 'hr', label: 'Ressources humaines' },
        { value: 'contact', label: 'Support client' },
        { value: 'team', label: 'Gestion d’équipe' },
    ]

    return (
        <>
            {/* Informations de base */}
                <Form.Group>
                    <Form.Row>
                        <Form.Field
                            name="name"
                            label="Nom de l’assistant"
                            placeholder="Assistant de facturation"
                        />

                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor="type" className="text-sm font-semibold text-gray-700">
                                Usage
                                <InfoTooltip
                                    id="tooltip-type"
                                    content='“Général” = polyvalent, “Spécialisé” = domaine précis.'
                                />
                            </label>
                            <Form.Select
                                name="type"
                                options={usageOptions}
                            />
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            <label htmlFor="module" className="text-sm font-semibold text-gray-700">
                                Domaine spécifique
                                <InfoTooltip
                                    id="tooltip-module"
                                    content="Si “Spécialisé”, précisez le domaine (facturation, RH…)."
                                />
                            </label>
                            <Form.Select
                                name="module"
                                options={moduleOptions}
                                onChange={(value) => {
                                    const isGeneral = form.watch('type') === 'general'
                                    const selectedValue = String(value)

                                    if (isGeneral && selectedValue !== '') {
                                        toast.warning('Le domaine spécifique ne peut pas être modifié pour un assistant général.')
                                        return
                                    }

                                    form.setValue('module', selectedValue)
                                }}


                            />

                        </div>
                    </Form.Row>
                </Form.Group>

            {/* Paramètres techniques */}
                <Form.Group>
                    <Form.Row>
                        <Form.Field
                            name="model"
                            label="Modèle OpenAI"
                            placeholder="gpt-4o-2025-04-14"
                        />
                        <Form.Field
                            name="temperature"
                            label="Créativité"
                            type="number"
                            step="0.1"
                        />
                        <Form.Field
                            name="max_tokens_output"
                            label="Longueur max. réponse"
                            type="number"
                        />
                    </Form.Row>
                </Form.Group>

            {/* Persona */}
                <Form.Group>
                    <Form.Row>
                        <Form.Field
                            name="persona"
                            label="Rôle de l'assistant"
                            placeholder="Ex. Expert RH, Coach sportif"
                        />
                    </Form.Row>
                </Form.Group>

            {/* Instructions système */}
                <Form.Group title="Instructions système">
                    <div className="w-full">
                        <label
                            htmlFor="instructions"
                            className="text-sm font-semibold text-gray-700 mb-2 block"
                        >
                            Consignes globales
                            <InfoTooltip
                                id="tooltip-instructions"
                                content="Définissez le ton, les priorités, les règles générales."
                            />
                        </label>
                        <Form.Field
                            type="textarea"
                            name="instructions"
                            id="instructions"
                        />
                    </div>
                </Form.Group>

                {/* Règles dynamiques */}
                <Form.Group title="Règles">
                    <label
                        htmlFor="rule-0"
                        className="block mb-2 text-sm font-semibold text-gray-700"
                    >
                        Règles à respecter
                    </label>

                    {ruleFields.map((field, index) => (
                        <Form.Row
                            key={field.id}
                            className="grid grid-cols-[1fr_auto] gap-4 items-center"
                        >
                            <Form.Field
                                id={`rule-${index}`}
                                name={`rules.${index}.value`}
                                type="text"
                                placeholder="Ex. Ne jamais inventer"
                            />
                            <button
                                type="button"
                                onClick={() => removeRule(index)}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                title="Supprimer la règle"
                            >
                                <Icon name="trash" className="w-10 h-10" />
                            </button>
                        </Form.Row>
                    ))}

                    <Form.Row className="flex justify-start">
                        <button
                            type="button"
                            onClick={() => appendRule({ value: '' })}
                            className="w-2/5 bg-primary text-white px-4 py-2 rounded text-sm text-center"
                        >
                            Ajouter une règle
                        </button>
                    </Form.Row>
                </Form.Group>

                {/* Prompts suggérés dynamiques */}
                <Form.Group title="Prompts suggérés">
                    <label
                        htmlFor="prompt-0"
                        className="block mb-2 text-sm font-semibold text-gray-700"
                    >
                        Suggestions pour démarrer
                    </label>

                    {promptFields.map((field, index) => (
                        <Form.Row
                            key={field.id}
                            className="grid grid-cols-[1fr_auto] gap-4 items-center"
                        >
                            <Form.Field
                                id={`prompt-${index}`}
                                name={`suggested_prompts.${index}.value`}
                                type="text"
                                placeholder="Ex. Comment puis-je t’aider ?"
                            />
                            <button
                                type="button"
                                onClick={() => removePrompt(index)}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                title="Supprimer la suggestion"
                            >
                                <Icon name="trash" className="w-10 h-10" />
                            </button>
                        </Form.Row>
                    ))}

                    <Form.Row className="flex justify-start">
                        <button
                            type="button"
                            onClick={() => appendPrompt({ value: '' })}
                            className="w-2/5 bg-primary text-white px-4 py-2 rounded text-sm text-center"
                        >
                            Ajouter une suggestion
                        </button>
                    </Form.Row>
                </Form.Group>
        </>
    )
}
