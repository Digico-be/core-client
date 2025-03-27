'use client'

import { getTenantUrl } from '@digico/utils'

import { ButtonLogout } from '@components/auth/ButtonLogout'
import { MenuItemSidebar } from '@components/dashboard/sidebar/MenuItemSidebar'
import { TenantLetterIcon } from '@components/workspace/TenantLetterIcon'

import { ButtonSettings } from './ButtonSettings'

export const MenuSidebar = ({ tenant }: { tenant: string }) => {
    const tenantLetter = tenant[0]?.toUpperCase() ?? '?'

    return (
        <div className="w-auto bg-main py-8 px-2">
            <ul className="h-full flex flex-col items-center">
                <MenuItemSidebar
                    href={getTenantUrl('/workspace')}
                    icon={<TenantLetterIcon letter={tenantLetter} size="sm" className="text-main bg-white" />
                    }
                />

                <MenuItemSidebar name="app" href={getTenantUrl('/')} />

                <MenuItemSidebar name={'contact'} href={getTenantUrl('/contact')} />

                <MenuItemSidebar name={'billing'} href={getTenantUrl('/billing/invoice')} />

                <li className="mt-auto flex flex-col">
                    <ButtonSettings />
                    <ButtonLogout />
                </li>
            </ul>
        </div>
    )
}
