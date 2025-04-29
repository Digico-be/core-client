import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(String(process.env.NEXT_PUBLIC_API_URL) + '/api/files')

export * from './create-file'
export * from './delete-file'
export * from './read-file'
