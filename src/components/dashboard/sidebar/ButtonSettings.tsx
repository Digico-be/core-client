import Link from 'next/link'

import { getTenantUrl } from '@digico/utils'

import { Icon } from '@components/Icon'

export const ButtonSettings = () => {
    return (
        <Link href={getTenantUrl('/settings/contact-details')} className="inline-flex cursor-pointer text-white p-5 rounded transition-all hover:bg-white hover:text-main">
            <Icon name="settings" className="fill-current size-8" />
        </Link>
    )
}
