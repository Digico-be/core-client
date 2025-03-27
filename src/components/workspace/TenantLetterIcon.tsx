import clsx from 'clsx'

type Props = {
    letter: string
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export const TenantLetterIcon = ({ letter, className, size = 'sm' }: Props) => {
    const sizeClass = {
        sm: 'text-sm size-7',
        md: 'text-base size-10',
        lg: 'text-2xl size-16',
    }[size]
    return (
        <div
            className={clsx(
                'flex items-center justify-center rounded-xs p-4 font-bold',
                sizeClass,
                className
            )}
            style={{ fontFamily: 'Arial Rounded MT Bold, sans-serif' }}
        >
            {letter}
        </div>
    )
}
