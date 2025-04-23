import { useState } from 'react'

import { FileService } from '../services/fileService'

import { IAFile } from '../models/file'

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false)

    const uploadFile = async (file: File): Promise<IAFile | null> => {
        setIsUploading(true)
        const uploaded = await FileService.upload(file)
        setIsUploading(false)

        return uploaded
    }

    return { uploadFile, isUploading }
}