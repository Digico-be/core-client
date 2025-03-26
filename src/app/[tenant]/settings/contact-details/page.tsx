'use client'

import { Grid } from '@digico/ui'

import { BoxBilling } from '@components/settings/billing/BoxBilling'
import { MenuSetting } from '@components/settings/MenuSetting'

export default function Page() {
    return (
        <Grid>
            <Grid.Col>
                <MenuSetting />
            </Grid.Col>

            <Grid.Col>
                <BoxBilling />

            </Grid.Col>
        </Grid>
    )
}
