'use client'

import { useForm } from 'react-hook-form'
import { Box, Button, Form } from '@digico/ui'
import { useRouterWithTenant } from '@digico/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createAssistant } from '../../services/assistant'

import { Assistant } from '../../models/assistant'

import { AssistantFields } from './form/AssistantFields'


export const CreateAssistantForm = () => {
    const form = useForm<Assistant>()
    const routerWithTenant = useRouterWithTenant()
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: createAssistant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assistants'] })
            routerWithTenant.push('/ia') // ou ta page liste des assistants
        }
    })

    const handleSubmit = (data: Assistant) => {
        // 💡 Parser JSON manuellement si textarea utilisée :
        try {
            data.rules = JSON.parse(data.rules as any)
        } catch {
            data.rules = []
        }
        try {
            data.suggested_prompts = JSON.parse(data.suggested_prompts as any)
        } catch {
            data.suggested_prompts = []
        }

        mutation.mutate(data)
    }

    return (
        <Box>
            <Form useForm={form} onSubmit={handleSubmit}>
                <AssistantFields />
                <Button isLoading={mutation.isPending} type="submit">
                    Créer l’assistant
                </Button>
            </Form>
        </Box>
    )
}
