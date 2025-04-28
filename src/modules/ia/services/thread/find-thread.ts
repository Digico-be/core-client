import { HttpService } from './index'

export const findThread = async (assistantOpenAiId: string, module?: string) => {
    const params = new URLSearchParams()
    params.append('assistant_openai_id', assistantOpenAiId)
    if (module) {
        params.append('module', module)
    }

    const queryString = params.toString()
    const url = `/find?${queryString}`

    try {
        return await HttpService.get(url)
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return null
        } else {
            console.error('❌ Erreur inconnue dans findThread:', error)
            throw error
        }
    }
}
