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
                        label="Email"
                        type="email"
                        placeholder="archi@codevo.be"
                    />
                    <Form.Field
                        name="password"
                        id="password"
                        label="Mot de passe"
                        type="password"
                        placeholder="*******"
                    />
                </Form.Row>
            </Form.Group>

            <Form.Group>
                <Form.Row>
                    <Form.Select
                        name="role"
                        label="Rôle"
                        options={userRoleOptions.map((opt) => ({ ...opt }))}
                    />
                </Form.Row>
            </Form.Group>
        </>
    )
}
