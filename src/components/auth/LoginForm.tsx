import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form } from '@digico/ui'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

import { useForgotPassword } from 'hooks/mutations/auth/useForgotPassword'
import { useLogin } from 'hooks/mutations/auth/useLogin'
import { LoginFormData } from 'types/auth.types'

export const LoginForm = () => {
    const form = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
            remember: false
        }
    })

    const login = useLogin()
    const forgotPassword = useForgotPassword() // Hook pour la réinitialisation du mot de passe

    const [isForgotPassword, setIsForgotPassword] = useState(false)

    const handleLoginSubmit = (data: LoginFormData) => {
        login.mutate(data, {
            onSuccess: (response: any) => {
                const expires_at = dayjs().add(response.data.expires_in, 'second').add(1, 'hours').toDate()

                Cookies.set('Authorization', response.data.token_type + ' ' + response.data.access_token, {
                    expires: expires_at,
                    sameSite: 'Strict'
                })

                window.location.assign(`/${response.data.tenant.id}`)
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    const handleForgotPasswordSubmit = (data: { email: string }) => {
        forgotPassword.mutate(data, {
            onSuccess: () => {
                toast.success("Un lien de réinitialisation a été envoyé à votre email.")
                setIsForgotPassword(false) // Revenir au formulaire de connexion après l'envoi
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    return (
        <Form useForm={form} onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleLoginSubmit}>
            <Form.Group>
                <Form.Field type="email" id="email" name="email" label="Adresse email" placeholder="info@diji.be" />
                {!isForgotPassword && (
                    <>
                        <Form.Field type="password" id="password" name="password" label="Mot de passe" placeholder="********" />
                        <div className="flex flex-wrap gap-4 justify-between items-center">
                            <Form.Checkbox id="remember" name="remember" label="Se souvenir de moi" />
                            <Button
                                intent="text"
                                className="text-primary hover:text-primary-active"
                                onClick={() => setIsForgotPassword(true)}
                            >
                                Mot de passe oublié ?
                            </Button>
                        </div>
                    </>
                )}
                {isForgotPassword && (
                    <div className="text-sm text-center">
                        <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
                        <Button
                            intent="text"
                            onClick={() => setIsForgotPassword(false)}
                        >
                            Retour à la connexion
                        </Button>
                    </div>
                )}

                <Button isLoading={login.isPending || forgotPassword.isPending} type="submit" className="w-full">
                    {isForgotPassword ? "Envoyer le lien" : "Se connecter"}
                </Button>
            </Form.Group>
        </Form>
    )
}
