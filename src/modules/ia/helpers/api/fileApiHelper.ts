export const uploadFileToOpenAI = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', 'user_data')

    const res = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
    })

    if (!res.ok) {
        console.error('Erreur API OpenAI :', res.statusText)
        return null
    }

    return await res.json()
}

export const deleteOpenAIFile = async (fileId: string) => {
    const res = await fetch('/api/delete-file', {
        method: 'POST',
        body: JSON.stringify({ fileId }),
        headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) {
        console.error('Erreur suppression fichier OpenAI', await res.text())
        return null
    }

    return await res.json()
}
