import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(String(process.env.NEXT_PUBLIC_API_URL) + '/api/file-messages')

export * from './create-file-message'
export * from './delete-file-message'
export * from './reads-file-message'