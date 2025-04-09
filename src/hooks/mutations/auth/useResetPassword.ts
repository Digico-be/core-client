import { useMutation } from '@tanstack/react-query';

import { resetPassword } from '../../../services/auth';
import { ResetPasswordFormData } from '../../../types/auth.types';

export const useResetPassword = () => {
    return useMutation<unknown, Error, ResetPasswordFormData, unknown>({
        mutationFn: (data: ResetPasswordFormData) => resetPassword(data)
    });
};
