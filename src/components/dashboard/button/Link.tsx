'use client'

import Link from 'next/link'

import { VariantProps } from 'class-variance-authority'

import { buttonStyle } from '.'

type Variants = VariantProps<typeof buttonStyle>

type Props = {
    children: React.ReactNode | string
    href: string
    className?: string
    intent?: Variants['intent']
    size?: Variants['size']
}

export const LinkCustom = ({ children, intent, size, className = '', ...restProps }: Props) => {
    const props = {
        ...restProps,
        className: buttonStyle({ intent, size, className })
    }

    return <Link {...props}>{children}</Link>
}
