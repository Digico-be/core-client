import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser } from '../../services/user/delete-user'

export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}
