import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(
    String(process.env.NEXT_PUBLIC_API_URL) + '/api/user'
)

export * from './read-user-tenants'

