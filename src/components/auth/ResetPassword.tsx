import { useRouter, useSearchParams } from 'next/navigation'

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useResetPassword } from '../../hooks/mutations/auth/useResetPassword'

const ResetPassword: React.FC = () => {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [mounted, setMounted] = useState<boolean>(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const token: string | null = searchParams.get('token')
    const emailFromQuery: string = searchParams.get('email') || ''

    const [email, setEmail] = useState<string>(emailFromQuery)
    const [password, setPassword] = useState<string>('')
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('')
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const resetPasswordMutation = useResetPassword()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})

        if (!token) {
            toast.error("Aucun token n'est présent dans l'URL")
            return
        }

        const payload = {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
        }

        resetPasswordMutation.mutate(payload, {
            onSuccess: (data: any) => {
                toast.success(data.message || 'Mot de passe réinitialisé avec succès.');
                router.push('/login');
            },
            onError: (error: any) => {
                console.error("Erreur pendant la réinitialisation :", error);

                // Utiliser error.response.data s'il existe, sinon utiliser error directement.
                const errorData = error?.response?.data || error;
                console.log("Détail de la réponse:", errorData);

                const responseErrors = errorData?.errors;
                if (responseErrors && Object.keys(responseErrors).length > 0) {
                    // Extraction des messages d'erreur
                    const messages: string[] = [];
                    Object.values(responseErrors).forEach((msgs: any) => {
                        messages.push(...msgs);
                    });
                    // Affichage dans le toast des messages détaillés
                    toast.error(messages.join(" - "));
                    // Optionnel : stocker les erreurs dans le state pour affichage dans le composant
                    setErrors(responseErrors);
                } else if (errorData?.message) {
                    // On affiche le message global s'il n'y a pas d'erreurs détaillées
                    toast.error(errorData.message);
                } else {
                    toast.error(error?.message || 'Erreur pendant la réinitialisation.');
                }
            }



        });

    }

    if (!mounted) return null
    if (!token) {
        return (
            <div>
                <h2>Erreur</h2>
                <p>Aucun token de réinitialisation a été trouvé dans URL.</p>
            </div>
        )
    }

    return (
        <div className="reset-password-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Réinitialiser le mot de passe</h2>
            {Object.keys(errors).length > 0 && (
                <div style={{ marginBottom: '1rem', color: 'red' }}>
                    {Object.values(errors).flat().map((message, index) => (
                        <div key={index} style={{ color: 'red', marginBottom: '0.5rem' }}>
                            {message}
                        </div>
                    ))}

                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email">Adresse email :</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password">Nouveau mot de passe :</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="passwordConfirmation">Confirmer le mot de passe :</label>
                    <input
                        type="password"
                        id="passwordConfirmation"
                        value={passwordConfirmation}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirmation(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Réinitialiser
                </button>
            </form>
        </div>
    )
}

export default ResetPassword
