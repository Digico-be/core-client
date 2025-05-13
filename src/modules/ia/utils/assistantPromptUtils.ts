import { Assistant } from '../models/assistant'

export const buildContextualPrompt = (
    assistant: Assistant | undefined,
    rawText: string
): string => {
    const rulesFormatted = Array.isArray(assistant?.rules)
        ? assistant.rules
        : typeof assistant?.rules === 'string'
            ? [assistant.rules]
            : []

    const metadataFormatted = assistant?.metadata
        ? Object.entries(assistant.metadata).map(([k, v]) => `- ${k}: ${v}`).join('\n')
        : ''

    return [
        assistant?.persona ? `👤 Persona : ${assistant.persona}` : '',
        assistant?.instructions ? `🧠 Instructions : ${assistant.instructions}` : '',
        rulesFormatted.length ? `📜 Règles :\n- ${rulesFormatted.join('\n- ')}` : '',
        metadataFormatted ? `📌 Métadonnées :\n${metadataFormatted}` : '',
        '',
        rawText
    ].filter(Boolean).join('\n\n')
}
