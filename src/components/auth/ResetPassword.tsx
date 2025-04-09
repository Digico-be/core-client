'use client'

import { useRouter,useSearchParams } from 'next/navigation'

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

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
    const [message, setMessage] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])

    const resetPasswordMutation = useResetPassword()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors([])
        setMessage('')

        if (!token) {
            setErrors(["Aucun token n'est présent dans l'URL"])
            return;
        }

        const payload = {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
        }

        resetPasswordMutation.mutate(payload, {
            onSuccess: (data: any) => {
                setMessage(data.message || 'Mot de passe réinitialisé avec succès.')
                router.push('/login')
            },
            onError: (error: any) => {
                console.error("Erreur pendant la réinitialisation :", error);

                // Aplatir les erreurs si elles existent
                const responseErrors = error?.response?.data?.errors;
                let errorMessages: string[] = [];
                if (responseErrors) {
                    // Object.values renvoie un tableau avec les valeurs (qui sont aussi des tableaux), on les aplatit ensuite.
                    // @ts-ignore
                    errorMessages = Object.values(responseErrors).flat();
                } else if (error?.response?.data?.message) {
                    errorMessages = [error.response.data.message];
                } else {
                    errorMessages = [error?.message || 'Erreur pendant la réinitialisation.'];
                }
                setErrors(errorMessages);
            },
        });


    }

    if (!mounted) return null

    if (!token) {
        return (
            <div>
                <h2>Load failed</h2>
                <p>Aucun token de réinitialisation a été trouvé dans URL.</p>
            </div>
        )
    }

    return (
        <div className="reset-password-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Réinitialiser le mot de passe</h2>
            {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
            {errors.length > 0 && (
                <ul style={{ color: 'red', marginBottom: '1rem' }}>
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
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
