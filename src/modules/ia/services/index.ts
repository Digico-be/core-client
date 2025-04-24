import { HttpRequestBuilder } from '@digico/utils'

export const HttpService = new HttpRequestBuilder(String(process.env.NEXT_PUBLIC_API_URL) + '/api/assistants')

export * from './create-assistant'
export * from './destroy-assistant'
export * from './read-assistant'
export * from './read-assistants'
export * from './update-assistant'
