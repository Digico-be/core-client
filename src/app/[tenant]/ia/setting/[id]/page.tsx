'use client'


import { UpdateAssistantForm } from '../../../../../modules/ia/components/setting/UpdateAssistantForm'

export default function EditAssistantPage() {
    return (
        <div className="max-w-4xl mx-auto pt-8">
            <h1 className="text-2xl font-bold mb-4">Modifier l’assistant IA</h1>
            <UpdateAssistantForm />
        </div>
    )
}
