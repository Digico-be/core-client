import { Menu } from '@digico/ui'
import { getTenantUrl } from '@digico/utils'

export const MenuSetting = () => {
    return (
        <Menu>
            <Menu.Item href={getTenantUrl('/settings/contact-details')}>Coordonnées de contact</Menu.Item>{' '}
            <Menu.Item href={getTenantUrl('/settings/user-rights')}>Droit des utilisateurs</Menu.Item>{' '}
        </Menu>
    )
}
