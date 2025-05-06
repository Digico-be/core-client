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

export const UpdateAssistantForm = () => {
    const { id } = useParams()
    const router = useRouterWithTenant()
    // on récupère la réponse et le flag isLoading
    const { data: response, isLoading, isError } = useReadAssistant(id as string)
    const updateAssistant = useUpdateAssistant()

    // 1) hook useForm toujours appelé
    const form = useForm<Assistant>()

    // 2) dès que la réponse arrive, on reset le form
    useEffect(() => {
        if (response) {
            // si votre API renvoie `{ data: Assistant }`
            const assistant = (response as any).data ?? response
            form.reset(assistant)
        }
    }, [response, form])

    // 3) pendant le chargement…
    if (isLoading) {
        return <Box>Chargement…</Box>
    }

    // 4) gestion d’erreur éventuelle
    if (isError || !response) {
        return <Box>Erreur de chargement.</Box>
    }

    // 5) au bout du compte, on affiche le form prérempli
    const handleSubmit = (values: Assistant) => {
        try {
            values.rules = JSON.parse(values.rules as any)
        } catch {
            values.rules = []
        }
        try {
            values.suggested_prompts = JSON.parse(values.suggested_prompts as any)
        } catch {
            values.suggested_prompts = []
        }

        updateAssistant.mutate(
            { ...values, openai_id: id as string },
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
