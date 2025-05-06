'use client'

import { Table } from '@digico/ui'
import { useRouterWithTenant } from '@digico/utils'

import { Assistant } from '../../models/assistant'

type Props = {
    items: Assistant[] | { data: Assistant[] }
}

export const AssistantTable = ({ items }: Props) => {
    const router = useRouterWithTenant()

    const toSettings = (assistant: Assistant) => {
        router.push(`/ia/setting/${assistant.openai_id}`)
    }
    const rawItems = Array.isArray(items) ? items : items.data ?? []

    const formattedItems = rawItems.map((a) => ({
        ...a,
        name: a.name || '–',
        type: a.type === 'general' ? 'Général' : 'Spécialisé',
        module: a.module || '–',
    }))

    return (
        <Table onClick={toSettings} items={formattedItems}>
            <Table.Head>OpenAI ID</Table.Head>
            <Table.Head>Nom</Table.Head>
            <Table.Head>Type</Table.Head>
            <Table.Head>Module</Table.Head>

            <Table.Col name="openai_id" />
            <Table.Col name="name" />
            <Table.Col name="type" />
            <Table.Col name="module" />
        </Table>

    )
}
