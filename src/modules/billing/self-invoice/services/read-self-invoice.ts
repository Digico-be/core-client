import { SelfInvoiceType } from '../types/self-invoice'
import { BillingItemType } from '@billing/billing-item/types/BillingItem'
import { TransactionType } from '@billing/types/transaction'
import { ContactType } from '@contact/types/contact'

import { HttpService } from '.'

export const readSelfInvoice = async (id: number, params?: Record<string, any>) =>
    HttpService.get<{
        data: SelfInvoiceType & {
            items?: BillingItemType[]
            transactions?: TransactionType[]
            contact?: ContactType
        }
    }>(`/${id}`, params).then((response) => {
        return response.data
    })
