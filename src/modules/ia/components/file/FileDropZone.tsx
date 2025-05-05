'use client'

import React from 'react'

interface FileDropZoneProps {
    onFileDrop: (file: File) => void
    onDragStateChange?: (dragging: boolean) => void
    children: React.ReactNode
    disabled?: boolean;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
                                                       children,
                                                       onFileDrop,
                                                       onDragStateChange,
                                                       disabled = false,
                                                   }) => {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;

        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFileDrop(file);
        onDragStateChange?.(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        onDragStateChange?.(true);
    };

    const handleDragLeave = () => {
        if (disabled) return;
        onDragStateChange?.(false);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {children}
        </div>
    );
};


export default FileDropZone
