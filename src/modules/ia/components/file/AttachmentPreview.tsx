'use client'

import React from 'react'
import { FaFileAlt, FaFileImage, FaFilePdf, FaFileWord } from 'react-icons/fa'

type Props = {
    openai_id: string
    filename: string
    size: number
    mime_type: string
}

const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${bytes} B`
}

const getIcon = (mime: string) => {
    if (mime.includes('pdf')) return <FaFilePdf className="text-red-500 text-2xl" />
    if (mime.includes('word') || mime.includes('doc')) return <FaFileWord className="text-blue-500 text-2xl" />
    if (mime.startsWith('image')) return <FaFileImage className="text-green-500 text-2xl" />
    return <FaFileAlt className="text-gray-500 text-2xl" />
}

const AttachmentPreview: React.FC<Props> = ({ filename, size, mime_type }) => {
    return (
            <div className="flex items-center gap-3 overflow-hidden">
                {getIcon(mime_type)}
                <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate text-sm text-gray-800">{filename}</span>
                    <span className="text-xs text-gray-500">{formatSize(size)}</span>
                </div>
            </div>

    )
}

export default AttachmentPreview
