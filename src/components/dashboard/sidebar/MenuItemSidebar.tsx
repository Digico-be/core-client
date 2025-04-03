import Link from 'next/link'

import clsx from 'clsx'

import { IconName } from '../../../types/name'

import { Icon } from '@components/Icon'

type Props = {
    name?: IconName
    href: string
    className?: string
    icon?: React.ReactNode
}

export const MenuItemSidebar = ({ name, className, icon, ...props }: Props) => {
    return (
        <li>
            <Link className={clsx('text-white flex p-5 rounded transition-all hover:bg-white hover:text-main', className)} {...props}>
                {icon ?? (name && <Icon className="size-7 fill-current" name={name} />)}
            </Link>
        </li>
    )
}
