import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(
    String(process.env.NEXT_PUBLIC_API_URL) + '/api/modules'
)

export * from './attach-module'
export * from './detach-module'
export * from './read-module-users'
export * from './read-modules'
