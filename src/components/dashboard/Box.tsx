import { cva, VariantProps } from 'class-variance-authority'

const classes = cva('rounded', {
    variants: {
        intent: {
            default: 'bg-white shadow-box',
            grey: 'bg-grey-100',
            success: 'bg-success-200',
            warning: 'bg-warning-200',
            error: 'bg-error-200'
        },
        size: {
            default: 'p-12',
            xl: 'p-24'
        }
    },
    defaultVariants: {
        intent: 'default',
        size: 'default'
    }
})

type Variants = VariantProps<typeof classes>

type Props = {
    children: React.ReactNode | string
    intent?: Variants['intent']
    size?: Variants['size']
    className?: string
    title?: string
    onClick?: (e: React.ChangeEvent<any>) => void
}

export const Box = ({ title, children, intent, size, className = '', ...props }: Props) => {
    return (
        <div className={classes({ intent, size, className })} {...props}>
            {title && <h1 className="text-md font-bold mb-12">{title}</h1>}
            {children}
        </div>
    )
}
