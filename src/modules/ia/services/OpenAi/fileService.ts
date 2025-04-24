import { uploadFileToOpenAI } from '../../helpers/api/fileApiHelper'
import { IAFile } from '../../models/file'

export class FileService {
    static async upload(file: File): Promise<IAFile | null> {
        try {

            const data = await uploadFileToOpenAI(file)
            if (!data?.id) {
                console.warn('[FileService] Réponse invalide de l\'API OpenAI :', data)
                return null
            }

            const result: IAFile = {
                id: data.id,
                filename: data.filename,
                uploadedAt: new Date().toISOString(),
                mimeType: file.type,
                size: file.size,
            }

            return result
        } catch (error) {
            console.error('Erreur dans FileService.upload :', error)
            return null
        }
    }
}
