'use client'

import { useParams } from 'next/navigation'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Form } from '@digico/ui'
import { useRouterWithTenant } from '@digico/utils'
import { toast } from 'sonner'

import { useReadAssistant } from '../../hooks/useReadAssistant'
import { useUpdateAssistant } from '../../hooks/useUpdateAssistant'

import { Assistant } from '../../models/assistant'

import { AssistantFields } from './form/AssistantFields'

// ✅ Type adapté à la structure du formulaire (array d’objets pour rules/prompts)
interface AssistantFormValues extends Omit<Assistant, 'rules' | 'suggested_prompts'> {
    rules: { value: string }[]
    suggested_prompts: { value: string }[]
}

// ✅ Fonction utilitaire pour parser les règles/prompts
function parseIfNeeded(input: unknown): { value: string }[] {
    try {
        const array = typeof input === 'string' ? JSON.parse(input) : input
        if (Array.isArray(array)) {
            return array.map((r: any) => ({ value: String(r) }))
        }
        return []
    } catch {
        return []
    }
}

export const UpdateAssistantForm = () => {
    const { id } = useParams()
    const router = useRouterWithTenant()
    const { data: response, isLoading, isError } = useReadAssistant(id as string)
    const updateAssistant = useUpdateAssistant()

    const form = useForm<AssistantFormValues>()

    useEffect(() => {
        if (response) {
            const assistant = (response as any).data ?? response

            form.reset({
                ...assistant,
                rules: parseIfNeeded(assistant.rules),
                suggested_prompts: parseIfNeeded(assistant.suggested_prompts),
            })
        }
    }, [response, form])

    if (isLoading) return <Box>Chargement…</Box>
    if (isError || !response) return <Box>Erreur de chargement.</Box>

    const handleSubmit = (values: AssistantFormValues) => {
        const formattedValues: Assistant = {
            ...values,
            rules: values.rules.map((r) => r.value).filter(Boolean),
            suggested_prompts: values.suggested_prompts.map((p) => p.value).filter(Boolean),
        }

        updateAssistant.mutate(
            { ...formattedValues, openai_id: id as string },
            {
                onSuccess: () => {
                    toast.success('Assistant mis à jour avec succès !')
                    router.push('/ia')
                },
                onError: () => {
                    toast.error('Échec de la mise à jour.')
                }
            }
        )
    }

    return (
        <Box>
            <Form useForm={form} onSubmit={handleSubmit}>
                <AssistantFields />
                <Button isLoading={updateAssistant.isPending} type="submit">
                    Mettre à jour
                </Button>
            </Form>
        </Box>
    )
}
