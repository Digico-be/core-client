'use client'

import { useRouter } from 'next/navigation'

import React from 'react'
import { VariantProps } from 'class-variance-authority'

import { buttonStyle } from '.'
import { Icon } from '@components/Icon'
import { Spinner } from '@components/dashboard/Spinner'
import { queryClient } from '@digico/utils'

type Variants = VariantProps<typeof buttonStyle>

type Props = {
    className?: string
    intent?: Variants['intent']
    size?: Variants['size']
    disabled?: boolean
    isLoading?: boolean
}

export const BackButton = ({ intent, size, className = '', isLoading = false, ...restProps }: Props) => {
    const router = useRouter()

    const props = {
        ...restProps,
        disabled: isLoading ? true : restProps.disabled,
        className: buttonStyle({ intent, size, className }),
        onClick: () => {
            router.back()
            queryClient.invalidateQueries()
        }
    }

    return (
        <button {...props}>
            {isLoading && <Spinner />}
            {!isLoading && (
                <div className="flex items-center gap-4">
                    <Icon name="arrow" className="size-4 rotate-90 fill-current" />
                    <span>Retour</span>
                </div>
            )}
        </button>
    )
}
