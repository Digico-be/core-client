import { MenuSidebar } from '@components/dashboard/sidebar/MenuSidebar'

type Props = {
    children: React.ReactNode
    tenant: string
}

export const DashboardLayout = ({ children, tenant }: Props) => {
    return (
        <div className="flex h-screen bg-grey-200">
            <MenuSidebar tenant={tenant} />
            <div className="flex-1 overflow-y-auto p-12">{children}</div>
        </div>
    )
}
