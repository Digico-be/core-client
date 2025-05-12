import { AssistantTemplate, assistantTemplates } from '../config/assistantTemplates'

/**
 * Retourne un template complet (tous les champs présents).
 * –`type`: 'general' | 'specialized' | 'radar'
 * –`module`: nom du module si specialized
 */
export function getAssistantTemplate(
    type: 'general' | 'specialized' | 'radar',
    module?: string,
): AssistantTemplate {
    const base = assistantTemplates[type];

    // Cas specialized: on fusionne les overrides du module s’ils existent
    if (type === 'specialized' && module) {
        const override = base.modules?.[module] ?? {};
        return {
            ...base,
            ...override,
            module,
        };
    }

    return base;
}
