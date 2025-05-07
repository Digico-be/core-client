import React, { createContext, useContext, useState } from 'react'
import { Box, Button } from '@digico/ui'

type ModalContextType = {
    open: boolean
    setOpen: (open: boolean) => void
}

const ModalContext = createContext<ModalContextType | null>(null)

type ModalProps = {
    children: React.ReactNode
    className?: string
    stateDefault?: boolean
}

const Modal = ({ children, className = '', stateDefault = false }: ModalProps) => {
    const [open, setOpen] = useState(stateDefault)

    return (
        <ModalContext.Provider value={{ open, setOpen }}>
            <div className={className}>{children}</div>
        </ModalContext.Provider>
    )
}

type TriggerProps = {
    children: React.ReactNode
}

const Trigger = ({ children }: TriggerProps) => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('Trigger must be used within a Modal')
    }

    const { setOpen } = context

    const handleModal = () => {
        setOpen(true)
    }

    return <span onClick={handleModal}>{children}</span>
}

type ContentProps = {
    children: (args: { handleClose: () => void }) => React.ReactNode
}

const Content = ({ children }: ContentProps) => {
    const context = useContext(ModalContext)

    if (!context) {
        throw new Error('Content must be used within a Modal')
    }

    const { open, setOpen } = context

    if (!open) return null

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div
            className={`bg-white border p-12 border-grey-400 w-full h-screen fixed top-0 left-0 z-[100] bg-secondary/70 flex justify-center items-center cursor-pointer pointer`}>
            <Box className="cursor-default min-w-[46rem]">
                <div className="mb-8 flex justify-end">
                    <Button intent={'main'} onClick={handleClose}>
                        Fermer
                    </Button>
                </div>
                <div>{children({ handleClose })}</div>
            </Box>
        </div>
    )
}

Modal.Trigger = Trigger
Modal.Content = Content

export { Modal }
