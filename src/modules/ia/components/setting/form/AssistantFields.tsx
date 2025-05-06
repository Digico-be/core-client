'use client'

import { Form } from '@digico/ui'

export const AssistantFields = () => {
    return (
        <>
            <Form.Group>
                <Form.Row>
                    <Form.Field name="name" label="Nom" placeholder="Billing Assistant" />
                    <Form.Field name="type" label="Type" placeholder="general ou specialized" />
                    <Form.Field name="module" label="Module" placeholder="billing (si specialized)" />
                </Form.Row>
            </Form.Group>

            <Form.Group>
                <Form.Row>
                    <Form.Field name="model" label="Modèle" placeholder="gpt-4.1-2025-04-14" />
                    <Form.Field name="temperature" label="Température" type="number" step="0.1" />
                    <Form.Field name="max_tokens_output" label="Max Tokens Output" type="number" />
                </Form.Row>
            </Form.Group>

            <Form.Group>
                <Form.Row>
                    <Form.Field name="persona" label="Persona" placeholder="Expert RH, Coach sportif..." />
                </Form.Row>
            </Form.Group>

            <Form.Group title="Instructions">
                <Form.Row>
                    <Form.Field type="textarea" name="instructions" label="Instructions" />
                </Form.Row>
            </Form.Group>

            <Form.Group title="Règles">
                <Form.Row>
                    <Form.Field type="textarea" name="rules" label="Règles (JSON)" placeholder='["Ne jamais inventer", "Utiliser un ton professionnel"]' />
                </Form.Row>
            </Form.Group>

            <Form.Group title="Prompts suggérés">
                <Form.Row>
                    <Form.Field
                        type="textarea"
                        name="suggested_prompts"
                        label="Prompts suggérés (JSON)"
                        placeholder='["Comment t’aider ?", "Quels sont mes droits ?"]'
                    />
                </Form.Row>
            </Form.Group>
        </>
    )
}
