import { useParams } from 'next/navigation'

import { FieldValues, useForm } from 'react-hook-form'
import { Button, Form } from '@digico/ui'
import { taxes } from 'data/taxes'
import { toast } from 'sonner'

import { useDestroyCreditNoteItem, useUpdateCreditNoteItem } from '@billing/credit-note/hooks/mutations'
import { BillingItemType } from '@billing/billing-item/types/BillingItem'

import { Icon } from '@components/Icon'

import { Modal } from '../Modal'

type Props = {
    item: BillingItemType & {
        cost: any
        retail: any
    }
}

export const CreditNoteItemEdit = ({ item }: Props) => {
    const { id } = useParams()

    const form = useForm({
        defaultValues: item
    })

    const updateCreditNoteItem = useUpdateCreditNoteItem()
    const destroyCreditNoteItem = useDestroyCreditNoteItem()

    const handleSubmit = (data: FieldValues, handleClose: any) => {
        updateCreditNoteItem.mutate(
            {
                credit_note_id: Number(id),
                id: Number(item.id),
                ...data
            },
            {
                onSuccess: () => {
                    handleClose()
                }
            }
        )
    }

    const handleDestroy = (handleClose: any) => {
        destroyCreditNoteItem.mutate(
            {
                credit_note_id: Number(id),
                id: Number(item.id)
            },
            {
                onSuccess: () => {
                    handleClose()
                    toast.success('Ligne mise à jour !')
                }
            }
        )
    }

    return (
        <Modal>
            <Modal.Trigger>
                <button type="button" className="text-grey-400 cursor-pointer">
                    <Icon name="edit" className="size-6 fill-current transition-all hover:fill-main" />
                </button>
            </Modal.Trigger>
            <Modal.Content>
                {({ handleClose }) => {
                    return (
                        <Form useForm={form} onSubmit={(data) => handleSubmit(data, handleClose)}>
                            <Form.Field label="Titre" name="name" placeholder="Nom" id="name" />
                            <Form.Field label="Quantité" name="quantity" placeholder="1" id="quantity" />
                            <Form.Select
                                name="vat"
                                label="Taux tva"
                                options={taxes.map((tax) => {
                                    return {
                                        label: String(tax),
                                        value: tax
                                    }
                                })}
                            />
                            <Form.Field label="Prix de vente" name="retail.subtotal" placeholder="1" id="retail.subtotal" />

                            <div className="flex flex-col gap-2">
                                <Button isLoading={updateCreditNoteItem.isPending} type="submit">
                                    Sauvegarder
                                </Button>
                                <Button isLoading={destroyCreditNoteItem.isPending} onClick={() => handleDestroy(handleClose)} intent={'error'} type="button">
                                    Supprimer
                                </Button>
                            </div>
                        </Form>
                    )
                }}
            </Modal.Content>
        </Modal>
    )
}
