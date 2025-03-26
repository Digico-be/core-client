import Link from 'next/link'

import clsx from 'clsx'

import { Icon, IconName } from '@components/Icon'

type Props = {
    name: IconName
    href: string
    className?: string
}

export const MenuItemSidebar = ({ name, className, ...props }: Props) => {
    return (
        <li>
            <Link className={clsx('text-white flex p-5 rounded transition-all hover:bg-white hover:text-main', className)} {...props}>
                <Icon className="size-7 fill-current" name={name} />
            </Link>
        </li>
    )
}
