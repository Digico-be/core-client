import { cva } from 'class-variance-authority'

export const buttonStyle = cva('transition-all leading-tight inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-70', {
    variants: {
        intent: {
            default: 'bg-primary font-medium text-white rounded hover:bg-primary-active focus:bg-primary-active',
            outlinePrimary: 'border border-primary font-medium text-primary rounded hover:bg-primary hover:text-white focus:bg-primary focus:text-white',
            grey200: 'bg-grey-200 font-medium rounded hover:bg-main focus:bg-main hover:text-white focus:text-white',
            text: 'font-medium underline !p-0 text-grey-600 transition-all hover:text-main',
            black: 'bg-black font-medium text-white rounded hover:bg-grey-800 focus:bg-grey-800',
            error: 'bg-error-200 font-medium text-error rounded hover:bg-error focus:bg-error hover:text-white focus:text-white',
            success: 'bg-success-200 font-medium text-success rounded hover:bg-success focus:bg-success hover:text-white focus:text-white'
        },
        size: {
            default: 'text-xs px-10 py-4'
        }
    },
    defaultVariants: {
        intent: 'default',
        size: 'default'
    }
})

export * from './BackButton'
export * from './Button'
