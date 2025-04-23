import React from 'react';

interface FileBubbleProps {
    fileId: string;
    filename?: string;
}

const FileBubble: React.FC<FileBubbleProps> = ({ fileId, filename }) => {
    return (
        <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-2">
            <span className="text-gray-700 text-sm">📄 {filename || 'Fichier joint'}</span>
            <a
                href={`https://api.openai.com/v1/files/${fileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-blue-500 underline text-sm"
            >
                Voir
            </a>
        </div>
    );
};

export default FileBubble;
