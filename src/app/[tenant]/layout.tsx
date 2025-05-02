import { AuthProvider } from '@digico/utils'

import { getAuthenticatedUser } from 'services/auth'

import { DashboardLayout } from 'layouts/DashboardLayout'
import AssistantWindow from '../../modules/ia/components/windows/AssistantWindow'

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const { user, tenant } = await getAuthenticatedUser()

    return (
        <AuthProvider tenant={tenant} user={user}>
            <DashboardLayout>{children}</DashboardLayout>
            <AssistantWindow />
        </AuthProvider>
    )
}
