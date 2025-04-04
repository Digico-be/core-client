'use client'

import { Grid, QuerySearchBar, useQueryParams } from '@digico/ui'

import { useReadCreditNotes } from '@billing/credit-note/hooks/queries'

import { ButtonCreateCreditNote } from '@billing/credit-note/components/ButtonCreateCreditNote'
import { CreditNoteTable } from '@billing/credit-note/components/CreditNoteTable'
import { MenuInvoice } from '@billing/invoice/components/MenuInvoice'

export default function Page() {
    const queryCreditNotes = useReadCreditNotes(useQueryParams())

    return (
        <Grid>
            <Grid.Col>
                <div className="flex justify-between">
                    <MenuInvoice />
                    <div className="flex gap-2 flex-shrink-0">
                        <ButtonCreateCreditNote />
                        <QuerySearchBar />
                    </div>
                </div>
            </Grid.Col>
            <Grid.Col>
                <CreditNoteTable items={queryCreditNotes.data?.data ?? []} />
            </Grid.Col>
        </Grid>
    )
}
