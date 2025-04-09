import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(String(process.env.NEXT_PUBLIC_API_URL) + '/api')

export * from './getAuthenticatedUser'
export * from './login'
export * from './logout'
export * from './resetPassword'
