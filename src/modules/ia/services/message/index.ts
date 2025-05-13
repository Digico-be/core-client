import { HttpRequestBuilder } from '@digico/utils'

/**
 * Service HTTP pointant vers /api/messages
 * (URL racine configurable via NEXT_PUBLIC_API_URL)
 */
export const HttpService = new HttpRequestBuilder(
    String(process.env.NEXT_PUBLIC_API_URL) + '/api/messages'
)

export * from './create-message'
export * from './delete-message'
export * from './read-messages'

