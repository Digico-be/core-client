const roleLabels: Record<string, string> = {
    guest: 'Invité',
    customer: 'Client',
    personnal: 'Personnel',
    admin: 'Administrateur',
}

export const formatRole = (role: string | null | undefined): string =>
    role ? roleLabels[role] ?? 'Inconnu' : 'Inconnu'
