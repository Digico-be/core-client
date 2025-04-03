'use client'

import {
    Grid,
    PageHeader,
    useQueryParams
} from '@digico/ui'
import { UserTable } from 'modules/module/composant/UserTable'

import { useReadUsers } from 'modules/module/hooks/user/useReadUsers'

import { Pagination } from '@components/dashboard/Pagination'
import { MenuSetting } from '@components/settings/MenuSetting'

export default function Page() {
    const queryParams = useQueryParams()
    const query = useReadUsers(queryParams)
    const result = query.data?.data

    return (
        <Grid>
            <Grid.Col>
                <MenuSetting />
            </Grid.Col>

            <Grid.Col>
                <div className="flex justify-between items-center">
                    <PageHeader>Droits utilisateurs</PageHeader>
                    {/*<div className="flex gap-2">
                        <QuerySearchBar />
                        <Button href="/settings/users/create">Ajouter un utilisateur</Button>
                    </div>*/}

                </div>
            </Grid.Col>

            <Grid.Col>
                <UserTable items={result?.users ?? []} />
            </Grid.Col>

            {result && (
                <Grid.Col>
                    <Pagination
                        className="mt-4"
                        pagination={{
                            current_page: result.current_page,
                            last_page: result.last_page,
                            total: result.total
                        }}
                    />
                </Grid.Col>
            )}

        </Grid>
    )
}
