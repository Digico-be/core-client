import { getAuthenticatedUser } from 'services/auth'

import { MenuHome } from '@components/dashboard/home/MenuHome'

export default async function Index() {
    const { tenant } = await getAuthenticatedUser()

    return (
        <div>
            <MenuHome tenant={tenant.name} />
        </div>
    )
}
