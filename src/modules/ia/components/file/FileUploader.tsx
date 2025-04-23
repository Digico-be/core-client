'use client'

import React, { useRef, useState } from 'react'

interface FileUploaderProps {
    onFileRead: (filename: string, file: File) => void
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileRead }) => {
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const handleFiles = async (files: FileList | null) => {
        if (!files) return

        for (const file of Array.from(files)) {
            try {
                onFileRead(file.name, file)
            } catch (error) {
                console.error(`Erreur lecture fichier ${file.name} :`, error)
            }
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-dashed border-2 rounded p-4 text-center cursor-pointer ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => inputRef.current?.click()}
        >
            <p className="text-sm text-gray-500">
                Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <input
                type="file"
                multiple
                accept=".txt,.pdf,.json,.csv"
                className="hidden"
                ref={inputRef}
                onChange={(e) => handleFiles(e.target.files)}
            />
        </div>
    )
}

export default FileUploader
