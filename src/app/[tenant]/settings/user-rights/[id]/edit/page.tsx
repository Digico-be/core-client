'use client'

import { useParams } from 'next/navigation'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Form,Grid, PageHeader } from '@digico/ui'
import { getTenantUrl } from '@digico/utils'
import { toast } from 'sonner'

import { useReadUser } from '../../../../../../modules/module/hooks/user/useReadUser'
import { useUpdateUser } from '../../../../../../modules/module/hooks/user/useUpdateUser'
import { UserType } from 'types/user.types'

import { UserFields } from '../../../../../../modules/module/composant/UserFields'

export default function EditUserPage() {
    const { id } = useParams()
    const userId = Number(id)

    const { data: user } = useReadUser(userId)

    const updateUser = useUpdateUser()
    type UserFormType = UserType & { password?: string }

    const form = useForm<UserFormType>()

    useEffect(() => {
        if ((user as any)?.data) {
            const userData = { ...(user as any).data, password: '' }
            form.reset(userData)
        }
    }, [user])

    const handleSubmit = (data: UserFormType) => {
        const { password, ...rest } = data

        updateUser.mutate(
            {
                id: userId,
                data: password ? { ...rest, password } : rest // n'envoie pas password s'il est vide
            },
            {
                onSuccess: () => toast.success('Utilisateur mis à jour avec succès'),
                onError: () => toast.error('Erreur lors de la mise à jour')
            }
        )
    }
    return (
        <Grid>
            <Grid.Col>
                <PageHeader label="Retour" href={getTenantUrl('/settings/user-rights')}>
                    Modifier l’utilisateur&nbsp;
                    {user ? `${user.firstname} ${user.lastname}` : `#${userId}`}
                </PageHeader>
            </Grid.Col>

            <Grid.Col>
                <Box>
                    <Form useForm={form} onSubmit={handleSubmit}>
                        <UserFields />
                        <Button type="submit" isLoading={updateUser.isPending}>
                            Mettre à jour
                        </Button>
                    </Form>
                </Box>
            </Grid.Col>
        </Grid>
    )
}
