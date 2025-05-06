'use client'

import { Button, Grid, PageHeader, QuerySearchBar, useQueryParams } from '@digico/ui'
import { useRouterWithTenant } from '@digico/utils'

import { useReadAssistants } from '../../../../modules/ia/hooks/useReadAssistants'

import { AssistantTable } from '../../../../modules/ia/components/setting/AssistantTable'


export default function AssistantPage() {
    const queryAssistants = useReadAssistants(useQueryParams())
    const router = useRouterWithTenant()

    return (
        <Grid>
            <Grid.Col>
                <div className="flex justify-between">
                    <PageHeader>Assistants IA</PageHeader>
                    <div className="flex gap-2 flex-shrink-0">
                        <QuerySearchBar />
                        <Button onClick={() => router.push('/ia/create')}>
                            Ajouter un assistant
                        </Button>
                    </div>
                </div>
            </Grid.Col>

            <Grid.Col>
                <AssistantTable items={queryAssistants.data ?? []} />
            </Grid.Col>
        </Grid>
    )
}
