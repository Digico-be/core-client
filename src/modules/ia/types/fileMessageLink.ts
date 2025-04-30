export interface FileMessageLink {
    file_openai_id: string
    message_openai_id: string
    thread_openai_id?: string
    file: {
        openai_id: string
        filename: string
        size: number
        mime_type: string
    }
}
