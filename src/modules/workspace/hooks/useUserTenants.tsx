import { useQuery } from '@tanstack/react-query'
import { readUserTenants } from '../services'

export const useUserTenants = () => {
    return useQuery({
        queryKey: ['user-tenants'],
        queryFn: readUserTenants
    })
}
