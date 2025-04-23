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