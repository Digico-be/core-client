import { ThreadMessageContent } from '../models/thread'

export function sanitizeThreadContent(
    content: ThreadMessageContent[]
): { type: 'text'; text: string }[] {
    return content
        .filter((c): c is { type: 'text'; text: string } =>
            c.type === 'text' && typeof c.text === 'string'
        )
        .map((c) => ({
            type: 'text' as const,
            text: c.text.trim(),
        }))
        .filter((c) => {
            // On garde soit un texte non vide, soit explicitement le placeholder 📎
            return c.text === '📎 Fichier joint' || c.text.length > 0;
        });
}
