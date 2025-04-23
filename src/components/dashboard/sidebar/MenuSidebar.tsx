'use client'

import { getTenantUrl } from '@digico/utils'

import { ButtonLogout } from '@components/auth/ButtonLogout'
import { MenuItemSidebar } from '@components/dashboard/sidebar/MenuItemSidebar'

import { ButtonSettings } from './ButtonSettings'

export const MenuSidebar = () => {
    return (
        <div className="w-auto bg-main py-8 px-2">
            <ul className="h-full flex flex-col items-center">
                <MenuItemSidebar name="app" href={getTenantUrl('/')} />

                <MenuItemSidebar name={'contact'} href={getTenantUrl('/contact')} />

                <MenuItemSidebar name={'billing'} href={getTenantUrl('/billing/invoice')} />

                <MenuItemSidebar name={'ia'} href={getTenantUrl('/ia')} />


                <li className="mt-auto flex flex-col">
                    <ButtonSettings />
                    <ButtonLogout />
                </li>
            </ul>
        </div>
    )
}
