import React from 'react'

interface FilePreviewProps {
    filename: string
    size?: number
}

const formatSize = (size: number) => {
    const kb = size / 1024
    const mb = kb / 1024
    return mb > 1 ? `${mb.toFixed(2)} Mo` : `${kb.toFixed(1)} Ko`
}

const FilePreview: React.FC<FilePreviewProps> = ({ filename, size }) => {
    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 max-w-xs">
            📄 <strong>{filename}</strong>
            {size !== undefined && <span className="ml-2 text-xs">({formatSize(size)})</span>}
        </div>
    )
}

export default FilePreview
