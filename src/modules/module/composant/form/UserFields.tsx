'use client'

import { Form } from '@digico/ui'
import { userRoleOptions } from '../../constants/userRoles'

export const UserFields = () => {
    return (
        <>
            <Form.Group>
                <Form.Row>
                    <Form.Field
                        name="firstname"
                        id="firstname"
                        label="Prénom"
                        placeholder="Archi"
                    />
                    <Form.Field
                        name="lastname"
                        id="lastname"
                        label="Nom"
                        placeholder="Balt"
                    />
                </Form.Row>
            </Form.Group>

            <Form.Group>
                <Form.Row>
                    <Form.Field
                        name="email"
                        id="email"
                        label="Adresse email"
                        placeholder="archi@codevo.be"
                        type="email"
                    />
                    <Form.Field
                        name="password"
                        id="password"
                        label="Mot de passe"
                        placeholder="********"
                        type="password"
                    />
                </Form.Row>
            </Form.Group>

            <Form.Group title="Rôle de l'utilisateur">
                <Form.Row>
                    <Form.Select
                        name="role"
                        label="Rôle"
                        options={[...userRoleOptions]}
                    />
                </Form.Row>
            </Form.Group>
        </>
    )
}
