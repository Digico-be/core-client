'use client'

import { Box, Button, Form } from '@digico/ui'
import { useForm } from 'react-hook-form'
import { useRouterWithTenant } from '@digico/utils'

import { UserFields } from './UserFields'
import { useCreateUser } from '../../hooks/user/useCreateUser'
import { UserRole } from '../../../../types/user.types'
import { toast } from 'sonner'

type FormValues = {
    firstname: string
    lastname: string
    email: string
    password: string
    role: UserRole
}

export const UserForm = () => {
    const form = useForm<FormValues>()
    const routerWithTenant = useRouterWithTenant()
    const createUser = useCreateUser()

    const onSubmit = (data: FormValues) => {
        createUser.mutate(data, {
            onSuccess: () => {
                toast.success("Utilisateur créé avec succès")
                routerWithTenant.push('/settings/user-rights')
            },
            onError: (error: any) => {
                console.error('Erreur création utilisateur :', error?.response?.data || error)
            }
        })
    }

    return (
        <Box>
            <Form useForm={form} onSubmit={onSubmit}>
                <UserFields />
                <Button type="submit" isLoading={createUser.isPending}>
                    Créer utilisateur
                </Button>
            </Form>
        </Box>
    )
}
