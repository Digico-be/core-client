import { type SVGProps } from 'react'

import { type IconName } from '../types/name'

export { IconName }

export const Icon = ({
    name,
    ...props
}: SVGProps<SVGSVGElement> & {
    name: IconName
    childClassName?: string
}) => {
    return (
        <svg {...props}>
            <use href={`/icons/${process.env.NEXT_PUBLIC_SPRITE_PATH}#${name}`} />
        </svg>
    )
}
