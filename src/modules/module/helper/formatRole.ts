export const formatRole = (role: string | null | undefined) => {
    switch (role) {
        case 'admin':
            return 'Administrateur'
        case 'editor':
            return 'Éditeur'
        case 'viewer':
            return 'Lecteur'
        default:
            return 'Inconnu'
    }
}
