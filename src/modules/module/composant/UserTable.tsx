'use client'

import { Table } from '@digico/ui'

//import { useRouterWithTenant } from '@digico/utils'
import { UserType } from 'types/user.types'

import { formatRole } from '../helper/formatRole'


type Props = {
    items: UserType[]
}

export const UserTable = ({ items }: Props) => {
    //const router = useRouterWithTenant()

    const toSingle = (user: UserType) => {
        //router.push(`/settings/users/${user.id}`)
        console.log("Hello", user)
    }

    const mappedItems = items.map((user) => ({
        ...user,
        formattedRole: formatRole(user.role),
    }))
    return (
        <Table onClick={toSingle} items={mappedItems}>
            <Table.Head>ID</Table.Head>
            <Table.Head>Prénom</Table.Head>
            <Table.Head>Nom</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Rôle</Table.Head>

            <Table.Col name="id" />
            <Table.Col name="firstname" />
            <Table.Col name="lastname" />
            <Table.Col name="email" />
            <Table.Col name="formattedRole" />
        </Table>
    )
}
