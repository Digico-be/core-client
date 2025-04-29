import { useState } from 'react'

import { createFile } from '../services/file'
import { FileService } from '../services/OpenAi/fileService'

import { IAFile } from '../models/file'

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false)

    const uploadFile = async (file: File): Promise<IAFile | null> => {
        setIsUploading(true)

        // Upload sur OpenAI
        const uploaded = await FileService.upload(file)

        if (!uploaded) {
            setIsUploading(false)
            return null
        }

        if (!uploaded.size || !uploaded.mimeType) {
            console.error('❌ Informations du fichier manquantes après upload.')
            setIsUploading(false)
            return null
        }

        // Enregistrer dans Laravel
        await createFile({
            openai_id: uploaded.id,
            filename: uploaded.filename,
            size: uploaded.size,
            mime_type: uploaded.mimeType,
        })

        setIsUploading(false)

        return uploaded
    }

    return { uploadFile, isUploading }
}