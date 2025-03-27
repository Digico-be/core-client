'use client'

import { getTenantUrl } from '@digico/utils'

import { TenantLetterIcon } from '@components/workspace/TenantLetterIcon'

import { MenuItemHome } from './MenuItemHome'

export const MenuHome = ({ tenant }: { tenant: string }) => {
    const tenantLetter = tenant[0]?.toUpperCase() ?? '?'

    return (
        <ul className="h-screen flex flex-wrap gap-12 items-center justify-center">
            <MenuItemHome name="contact" href={getTenantUrl('/contact')}>
                Contacts
            </MenuItemHome>

            <MenuItemHome name="billing" href={getTenantUrl('/billing/invoice')}>
                Finances
            </MenuItemHome>

            <MenuItemHome
                href={getTenantUrl('/workspace')}
                icon={<TenantLetterIcon letter={tenantLetter} size="lg" className="text-primary bg-none group-hover:text-white"/>
                }
            >
                Workspace
            </MenuItemHome>
        </ul>
    )
}

