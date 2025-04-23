'use client'

import React from 'react'

interface FileDropZoneProps {
    onFileDrop: (file: File) => void
    onDragStateChange?: (dragging: boolean) => void
    children: React.ReactNode
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
                                                       onFileDrop,
                                                       onDragStateChange,
                                                       children
                                                   }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        onDragStateChange?.(true)
    }

    const handleDragLeave = () => {
        onDragStateChange?.(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        onDragStateChange?.(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            onFileDrop(file)
        }
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="w-full"
        >
            {children}
        </div>
    )
}

export default FileDropZone
