import { HttpService } from '.'

export const forgotPassword = (data: { email: string }) => {
    return HttpService.post('/forgot-password', data)
}
