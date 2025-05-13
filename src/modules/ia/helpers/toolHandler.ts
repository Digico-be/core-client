import { functionsDefinition } from '../functions/functionsDefinition'

import { fetchLaravelData } from './fetchLaravelData'

export const handleToolCall = async (
    functionName: string,
    rawArgs: string,
    workspace: string,
): Promise<any> => {
    const args = JSON.parse(rawArgs ?? '{}')
    const found = functionsDefinition.find(fn => fn.function.name === functionName)
    if (!found) throw new Error(`Fonction "${functionName}" non trouvée.`)

    let endpoint = found.function.parameters?.properties?.endpoint?.default
    if (!endpoint) throw new Error(`Aucun endpoint pour "${functionName}".`)

    Object.entries(args).forEach(([k, v]) => {
        if (typeof v === 'string') {
            endpoint = endpoint.replace(`{${k}}`, encodeURIComponent(v))
        }
    })

    const apiData = await fetchLaravelData(endpoint, workspace)
    const link = found.function.pageLink?.(workspace, args)

    return {
        ...apiData,
        ...(link ? { link } : {}),
    }
}
