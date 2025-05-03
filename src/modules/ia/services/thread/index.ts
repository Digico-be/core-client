import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(String(process.env.NEXT_PUBLIC_API_URL) + '/api/threads')

export * from './create-thread'
export * from './delete-thread'
export * from './find-thread'
export * from './list-threads'
export * from './read-thread'


