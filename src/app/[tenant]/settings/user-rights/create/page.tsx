import { UserForm } from '../../../../../modules/module/composant/form/UserForm'

export default function CreateUserPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Créer un utilisateur</h1>
            <UserForm />
        </div>
    )
}
