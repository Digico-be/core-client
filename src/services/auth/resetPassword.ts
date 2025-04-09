import { ResetPasswordFormData } from 'types/auth.types';

import { HttpService } from '.'

export const resetPassword = (data: ResetPasswordFormData) => {
    return HttpService.post(`/reset-password`, data);
};
