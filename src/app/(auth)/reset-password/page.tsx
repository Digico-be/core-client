'use client'

import React from 'react'
import { Box, ImageBuilder } from '@digico/ui'

import ResetPassword from 'components/auth/ResetPassword'

export default function ResetPasswordPage() {
    return (
        <div className="h-screen flex">
            <div className="w-full max-mobile:hidden relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-primary/80">
                <ImageBuilder
                    className="w-full h-full object-cover object-center"
                    src="/images/auth-background.jpg"
                />
            </div>

            <div className="w-[52rem] max-mobile:w-full flex flex-col gap-20 items-center justify-center flex-shrink-0 p-20 max-mobile:p-12">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-primary">Diji</h1>
                    <p className="text-grey-800 text-sm">Réinitialisation du mot de passe</p>
                </div>

                <Box className="w-full" intent="info" size="default">
                    <ResetPassword />
                </Box>
            </div>
        </div>
    )
}
