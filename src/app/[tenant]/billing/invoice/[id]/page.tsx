'use client'

import { useParams } from 'next/navigation'

import { BillingDocument } from '@billing/document'
import { Grid, PageHeader } from '@digico/ui'
import { getTenantUrl } from '@digico/utils'

import { useReadInvoice } from '@billing/invoice/hooks/queries'

import { InvoiceContentEditable } from '@billing/invoice/components/document/InvoiceContentEditable'
import { SummaryInvoice } from '@billing/invoice/components/Summary'

export default function Page() {
    const { id } = useParams()
    const { data } = useReadInvoice(Number(id))

    return (
        <Grid>
            <Grid.Col>
                <PageHeader label="Retour aux factures" href={getTenantUrl('/billing/invoice')}>
                    Facture {data?.identifier}
                </PageHeader>
            </Grid.Col>
            <Grid.Col column={7}>
                <BillingDocument data={data}>
                    <InvoiceContentEditable />
                </BillingDocument>
            </Grid.Col>
            <Grid.Col column={5}>
                <SummaryInvoice />
            </Grid.Col>
        </Grid>
    )
}
