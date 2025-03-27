'use client'

import { Button, Table } from '@digico/ui'
import { useRouterWithTenant } from '@digico/utils'
import { toast } from 'sonner'

import { useAuthenticatedUser } from '../hooks/user/useAuthenticatedUser'
import { useDeleteUser } from '../hooks/user/useDeleteUser'
import { UserType } from 'types/user.types'

import { DropdownMenu } from '@components/dashboard/DropdownMenu'

import { formatRole } from '../helper/formatRole'

type Props = {
    items: UserType[]
}

export const UserTable = ({ items }: Props) => {
    const router = useRouterWithTenant()
    const { data } = useAuthenticatedUser()

    const currentUserId = data?.user.id

    const mappedItems = items.map((user) => ({
        ...user,
        formattedRole: formatRole(user.role),
    }))

    const handleUpdateRight = (id: number) => {
        router.push(`/settings/user-rights/${id}/right`)
    }

    const deleteUser = useDeleteUser()

    const handleDelete = (id: number) => {
        if (currentUserId === id) {
            toast.error("Vous ne pouvez pas vous supprimer vous-même.")
            return
        }

        if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return

        deleteUser.mutateAsync(id)
            .then(() => toast.success('Utilisateur supprimé avec succès.'))
            .catch(() => toast.error('Erreur lors de la suppression.'))
    }

    return (
        <Table items={mappedItems}>
            <Table.Head>ID</Table.Head>
            <Table.Head>Prénom</Table.Head>
            <Table.Head>Nom</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Rôle</Table.Head>
            <Table.Head>Actions</Table.Head>

            <Table.Col name="id" />
            <Table.Col name="firstname" />
            <Table.Col name="lastname" />
            <Table.Col name="email" />
            <Table.Col name="formattedRole" />
            <Table.Col>
                {(row) => (
                    <DropdownMenu>
                        <DropdownMenu.Item>
                            <Button
                                className="w-full"
                                intent="default"
                                onClick={() => handleUpdateRight(row.id)}
                            >
                                Modifier les droits
                            </Button>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item>
                            <Button
                                className="w-full"
                                intent="default"
                                onClick={() => router.push(`/settings/user-rights/${row.id}/edit`)}
                            >
                                Modifier l’utilisateur
                            </Button>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item>
                            <Button
                                className="w-full"
                                intent="error"
                                onClick={() => handleDelete(row.id)}
                            >
                                Supprimer
                            </Button>
                        </DropdownMenu.Item>
                    </DropdownMenu>
                )}
            </Table.Col>
        </Table>
    )
}
