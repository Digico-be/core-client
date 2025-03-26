import React from 'react'
import { VariantProps } from 'class-variance-authority'

import { LinkCustom } from './Link'

import { buttonStyle } from '.'
import { Spinner } from '@components/dashboard/Spinner'

type Variants = VariantProps<typeof buttonStyle>

type Props = {
    children: React.ReactNode | string
    type?: 'button' | 'submit'
    className?: string
    intent?: Variants['intent']
    size?: Variants['size']
    disabled?: boolean
    isLoading?: boolean
    onClick?: () => void
    href?: string
}

export const Button = ({ children, intent, size, className = '', isLoading = false, href, ...restProps }: Props) => {
    const props = {
        ...restProps,
        disabled: isLoading ? true : restProps.disabled,
        className: buttonStyle({ intent, size, className })
    }

    if (href) {
        const propsLink = {
            children,
            href,
            intent,
            size,
            className
        }

        return <LinkCustom {...propsLink} />
    }

    return (
        <button {...props}>
            {isLoading && <Spinner />}
            {!isLoading && <span>{children}</span>}
        </button>
    )
}
