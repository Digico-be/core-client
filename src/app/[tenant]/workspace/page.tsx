'use client'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import { useUserTenants } from '../../../modules/workspace/hooks/useUserTenants'

import { TenantLetterIcon } from '@components/workspace/TenantLetterIcon'

export default function SwitchWorkspacePage() {
    const router = useRouter()
    const { data, isLoading } = useUserTenants()

    const handleSwitch = (tenantId: string) => {
        toast.success('Changement de workspace...')
        router.push(`/${tenantId}`)
    }

    return (
        <div>
            {isLoading ? (
                <p>Chargement des workspaces...</p>
            ) : (
                <ul className="flex flex-wrap gap-12 items-center justify-center py-8">
                    {data?.tenants.map((tenant) => {
                        const letter = tenant.name[0]?.toUpperCase() ?? '?'

                        return (
                            <li
                                key={tenant.id}
                                onClick={() => handleSwitch(tenant.id)}
                                className="cursor-pointer bg-white w-48 h-48 flex flex-col items-center justify-center rounded border border-grey-400 shadow transition-all hover:bg-main group">
                                <TenantLetterIcon letter={letter} size="lg" className="text-primary group-hover:text-white transition-colors" />
                                <h2 className="mt-4 text-sm text-grey-800 font-medium group-hover:text-white transition-colors">{tenant.name}</h2>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
