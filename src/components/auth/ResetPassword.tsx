import { useRouter, useSearchParams } from 'next/navigation'

import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button, Form } from '@digico/ui'
import { toast } from 'sonner'

import { useResetPassword } from '../../hooks/mutations/auth/useResetPassword'

interface ResetPasswordFormData {
    email: string
    password: string
    passwordConfirmation: string
}

const ResetPassword: React.FC = () => {
    const searchParams = useSearchParams()
    const router = useRouter()

    const token: string | null = searchParams.get('token')
    const emailFromQuery: string = searchParams.get('email') || ''

    // Initialisation du formulaire avec react-hook-form
    const form = useForm<ResetPasswordFormData>({
        defaultValues: {
            email: emailFromQuery,
            password: '',
            passwordConfirmation: '',
        },
    })

    const resetPasswordMutation = useResetPassword()

    // Définition de la fonction de soumission
    const onSubmit: SubmitHandler<ResetPasswordFormData> = (data) => {
        if (!token) {
            toast.error("Aucun token n'est présent dans l'URL")
            return
        }

        const payload = {
            token,
            email: data.email,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
        }

        resetPasswordMutation.mutate(payload, {
            onSuccess: (response: any) => {
                toast.success(response.message || 'Mot de passe réinitialisé avec succès.')
                router.push('/login')
            },
            onError: (error: any) => {
                const errorData = error?.response?.data || error
                const responseErrors = errorData?.errors
                if (responseErrors && Object.keys(responseErrors).length > 0) {
                    const messages: string[] = []
                    Object.values(responseErrors).forEach((msgs: any) => {
                        messages.push(...msgs)
                    })
                    toast.error(messages.join(" - "))
                } else if (errorData?.message) {
                    toast.error(errorData.message)
                } else {
                    toast.error(error?.message || 'Erreur pendant la réinitialisation.')
                }
            },
        })
    }

    // Wrapper pour gérer l'événement de soumission
    const handleFormSubmit = (e: any) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        form.handleSubmit(onSubmit)();
    }


    // Si aucun token n'est présent dans l'URL, on affiche un message d'erreur.
    if (!token) {
        return (
            <div className="max-w-md mx-auto p-6">
                <h2 className="text-xl font-bold">Erreur</h2>
                <p>Aucun token de réinitialisation a été trouvé dans URL.</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-semibold text-center mb-4">Réinitialiser le mot de passe</h2>
            <Form useForm={form} onSubmit={handleFormSubmit}>
                <Form.Group>
                    <Form.Field
                        type="email"
                        id="email"
                        name="email"
                        label="Adresse email"
                        placeholder="Entrez votre email"
                    />
                    <Form.Field
                        type="password"
                        id="password"
                        name="password"
                        label="Nouveau mot de passe"
                        placeholder="Nouveau mot de passe"
                    />
                    <Form.Field
                        type="password"
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        label="Confirmer le mot de passe"
                        placeholder="Confirmer le mot de passe"
                    />
                    <Button
                        isLoading={resetPasswordMutation.status === 'pending'}
                        type="submit"
                        className="w-full"
                    >
                        Réinitialiser
                    </Button>
                </Form.Group>
            </Form>
        </div>
    )
}

export default ResetPassword
