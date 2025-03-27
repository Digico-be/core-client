'use client'

import { useParams } from 'next/navigation'

import { useEffect, useState } from 'react'
import { Grid, PageHeader, Table } from '@digico/ui'
import { getTenantUrl } from '@digico/utils'

import { useAttachModule } from '../../../../../../modules/module/hooks/module/useAttachModule'
import { useDetachModule } from '../../../../../../modules/module/hooks/module/useDetachModule'
import { useReadModulesForUser } from '../../../../../../modules/module/hooks/module/useReadModuleForUser'
import { useReadUser } from '../../../../../../modules/module/hooks/user/useReadUser'

import { LoadingQuery } from '@components/dashboard/LoadingQuery'

export type ModuleType = {
    id: number
    name: string
    assigned?: boolean
}

export default function UserModulesPage() {
    const { id } = useParams()
    const userId = Number(id)

    const modulesQuery = useReadModulesForUser(userId)
    const attachModuleMutation = useAttachModule()
    const detachModuleMutation = useDetachModule()
    const userQuery = useReadUser(userId)

    const [modulesState, setModulesState] = useState<ModuleType[]>([])

    // Met à jour le state local une fois les données chargées
    useEffect(() => {
        if (modulesQuery.data) {
            setModulesState(modulesQuery.data)
        }
    }, [modulesQuery.data])

    const handleCheckboxChange = (checked: boolean, moduleId: number) => {
        // Update côté serveur
        if (checked) {
            attachModuleMutation.mutate({ moduleId, userId })
        } else {
            detachModuleMutation.mutate({ moduleId, userId })
        }

        // Mise à jour immédiate du state local pour réaction visuelle
        setModulesState((prevModules) =>
            prevModules.map((module) =>
                module.id === moduleId ? { ...module, assigned: checked } : module
            )
        )
    }

    return (
        <Grid>
            <Grid.Col>
                <PageHeader label="Retour" href={getTenantUrl('/settings/user-rights')}>
                    {userQuery.data
                        ? `Modules de ${userQuery.data.firstname} ${userQuery.data.lastname}`
                        : `Modules de l’utilisateur #${userId}`}
                </PageHeader>
            </Grid.Col>

            <Grid.Col>
                <LoadingQuery query={modulesQuery}>
                    {() => (
                        <Table items={modulesState}>
                            <Table.Head>ID</Table.Head>
                            <Table.Head>Nom</Table.Head>
                            <Table.Head>Assigné</Table.Head>

                            <Table.Col name="id" />
                            <Table.Col name="name" />
                            <Table.Col>
                                {(item: ModuleType) => (
                                    <input
                                        type="checkbox"
                                        checked={item.assigned ?? false}
                                        onChange={(e) =>
                                            handleCheckboxChange(e.target.checked, item.id)
                                        }
                                    />
                                )}
                            </Table.Col>
                        </Table>
                    )}
                </LoadingQuery>
            </Grid.Col>
        </Grid>
    )
}
