import type { Metadata } from 'next'

import { QueryProvider } from '@digico/utils'
import { Toaster } from 'sonner'

import '../css/index.css'

export const metadata: Metadata = {
    title: 'Diji'
}

type Props = Readonly<{
    children: React.ReactNode
}>

export default function RootLayout({ children }: Props) {
    return (
        <html lang="fr">
            <body>
                <QueryProvider>
                    {children}
                </QueryProvider>
                <Toaster richColors position="bottom-right" />
            </body>
        </html>
    )
}
