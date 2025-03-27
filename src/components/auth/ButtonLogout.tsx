'use client'

import { useRouter } from 'next/navigation'

import { useLogout } from 'hooks/mutations/auth/useLogout'

import { Icon } from '@components/Icon'

export const ButtonLogout = () => {
    const router = useRouter()
    const logout = useLogout()

    const handleLogout = () => {
        logout.mutate(undefined, {
            onSuccess: () => {
                router.push('/')
            }
        })
    }

    return (
        <button type="button" onClick={handleLogout} className="cursor-pointer text-white p-5 rounded transition-all hover:bg-white hover:text-main">
            <Icon name="logout" className="size-8 fill-current" />
        </button>
    )
}
