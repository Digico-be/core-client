'use client'

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { Tooltip } from 'react-tooltip'
import { Form } from '@digico/ui'

import { Icon } from '@components/Icon'

import 'react-tooltip/dist/react-tooltip.css'

// Définition des types du formulaire
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
    const { control } = useFormContext<AssistantFormValues>()

    const {
        fields: ruleFields,
        append: appendRule,
        remove: removeRule,
    } = useFieldArray({
        control,
        name: 'rules',
    })

    const {
        fields: promptFields,
        append: appendPrompt,
        remove: removePrompt,
    } = useFieldArray({
        control,
        name: 'suggested_prompts',
    })

    return (
        <>
            {/* Informations de base */}
            <Form.Group>
                <Form.Row>
                    <Form.Field
                        name="name"
                        label={
                            <>
                                Nom de l’assistant
                                <span
                                    data-tooltip-id="tooltip-name"
                                    data-tooltip-content="Choisissez un nom clair pour cet assistant, par exemple “Assistant de facturation”."
                                    className="inline-block ml-1 cursor-pointer"
                                >
                  <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
                </span>
                                <Tooltip id="tooltip-name" place="top" />
                            </>
                        }
                        placeholder="Assistant de facturation"
                    />

                    <Form.Field
                        name="type"
                        label={
                            <>
                                Usage
                                <span
                                    data-tooltip-id="tooltip-type"
                                    data-tooltip-content="Sélectionnez “Général” pour un assistant polyvalent ou “Spécialisé” pour un domaine précis."
                                    className="inline-block ml-1 cursor-pointer"
                                >
                  <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
                </span>
                                <Tooltip id="tooltip-type" place="top" />
                            </>
                        }
                        placeholder="Général ou Spécialisé"
                    />

                    <Form.Field
                        name="module"
                        label={
                            <>
                                Domaine spécifique
                                <span
                                    data-tooltip-id="tooltip-module"
                                    data-tooltip-content="Si vous avez choisi “Spécialisé”, indiquez le domaine (ex. facturation, ressources humaines)."
                                    className="inline-block ml-1 cursor-pointer"
                                >
                  <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
                </span>
                                <Tooltip id="tooltip-module" place="top" />
                            </>
                        }
                        placeholder="facturation, hr, etc."
                    />
                </Form.Row>
            </Form.Group>

            {/* Paramètres techniques */}
            <Form.Group>
                <Form.Row>
                    <Form.Field
                        name="model"
                        label="Modèle OpenAI"
                        placeholder="gpt-4.1-2025-04-14"
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

            {/* Instructions système sur toute la largeur */}
            <Form.Group title="Instructions système">
                <div className="w-full">
                    <Form.Field
                        type="textarea"
                        name="instructions"
                        label={
                            <>
                                Consignes globales
                                <span
                                    data-tooltip-id="tooltip-instructions"
                                    data-tooltip-content="Indiquez comment l’assistant doit se comporter (ex. rester factuel, toujours vérifier les informations)."
                                    className="inline-block ml-1 cursor-pointer"
                                >
                  <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
                </span>
                                <Tooltip id="tooltip-instructions" place="top" />
                            </>
                        }
                    />
                </div>
            </Form.Group>

            {/* Règles dynamiques */}
            <Form.Group title="Règles">
                {ruleFields.map((field, index) => (
                    <Form.Row
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
                    >
                        <Form.Field
                            name={`rules.${index}.value`}
                            type="text"
                            label={index === 0 ? 'Règles à respecter' : undefined}
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
                <Form.Row>
                    <button
                        type="button"
                        onClick={() => appendRule({ value: '' })}
                        className="inline-flex items-center text-blue-600 font-medium hover:underline gap-1"
                    >
                        <Icon name="add" className="w-10 h-10" />
                    </button>
                </Form.Row>
            </Form.Group>

            {/* Prompts suggérés dynamiques */}
            <Form.Group title="Prompts suggérés">
                {promptFields.map((field, index) => (
                    <Form.Row
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
                    >
                        <div className="flex items-center">
                            <Form.Field
                                name={`suggested_prompts.${index}.value`}
                                type="text"
                                label={index === 0 ? 'Suggestions pour démarrer' : undefined}
                                placeholder="Ex. Comment puis-je t’aider ?"
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center justify-center h-full">
                            <button
                                type="button"
                                onClick={() => removePrompt(index)}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                title="Supprimer la suggestion"
                            >
                                <Icon name="trash" className="w-6 h-6" />
                            </button>
                        </div>
                    </Form.Row>
                ))}
                <Form.Row>
                    <button
                        type="button"
                        onClick={() => appendPrompt({ value: '' })}
                        className="inline-flex items-center text-blue-600 font-medium hover:underline gap-1"
                    >
                        <Icon name="add" className="w-6 h-6" />
                    </button>
                </Form.Row>
            </Form.Group>


        </>
    )
}
