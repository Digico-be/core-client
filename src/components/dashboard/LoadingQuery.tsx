'use client'

import React, { useCallback } from 'react'
import { Box } from '@digico/ui'
import { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BackButton } from '@components/dashboard/button/BackButton'
import { Pagination } from '@components/dashboard/Pagination'
import { Spinner } from '@components/dashboard/Spinner'

type Props<T = unknown> = {
    query: UseQueryResult<T>
    children: (data: T) => React.ReactNode
}

export const LoadingQuery = <T,>({ children, query }: Props<T>) => {
    const renderContent = useCallback(() => {
        if (query.isLoading) {
            return (
                <div className="absolute top-0 left-0 z-50 bg-grey-100 w-full h-screen flex justify-center items-center py-12">
                    <Spinner className="size-12" />
                </div>
            )
        }

        if (query.isSuccess) {
            return (
                <>
                    {children(query.data)}
                    <Pagination className="mt-12" {...query.data} />
                </>
            )
        }

        toast.error(query.error?.message, {
            duration: 10000
        })

        return (
            <div className={`fixed top-0 left-0 bg-secondary/80 w-full h-full flex justify-center items-center flex-col`}>
                <Box className="flex flex-col items-center">
                    <h2 className="relative z-10 text-sm font-medium mb-8">Une erreur est survenue !</h2>
                    <BackButton intent={'black'} />
                </Box>
            </div>
        )
    }, [query, children])

    return renderContent()
}
