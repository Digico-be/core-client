import { deleteOpenAIFile, uploadFileToOpenAI } from '../../helpers/api/fileApiHelper'
import { IAFile } from '../../models/file'

export class FileService {
    static async upload(file: File): Promise<IAFile | null> {
        try {
            const data = await uploadFileToOpenAI(file)
            if (!data?.id) {
                console.warn("[FileService] Réponse invalide de l'API OpenAI :", data)
                return null
            }

            return {
                id: data.id,
                filename: data.filename,
                uploadedAt: new Date().toISOString(),
                mimeType: file.type,
                size: file.size
            }
        } catch (error) {
            console.error('Erreur dans FileService.upload :', error)
            return null
        }
    }

    static async delete(fileId: string): Promise<boolean> {
        try {
            const res = await deleteOpenAIFile(fileId)
            return !!res?.success
        } catch (error) {
            console.error('Erreur dans FileService.delete :', error)
            return false
        }
    }
}
