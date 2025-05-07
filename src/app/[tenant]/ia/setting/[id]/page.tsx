'use client'

import { PageHeader } from '@digico/ui'
import { getTenantUrl } from '@digico/utils'

import { UpdateAssistantForm } from '../../../../../modules/ia/components/setting/UpdateAssistantForm'

export default function EditAssistantPage() {
    return (
        <div className="max-w-8xl mx-auto pt-8 px-4">
            <PageHeader
                label="Retour aux assistants"
                href={getTenantUrl('/ia')}
            >
                Modifier l’assistant IA
            </PageHeader>

            <UpdateAssistantForm />
        </div>
    );
}
