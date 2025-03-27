type Props = {
    className?: string
}

export const Spinner = ({ className = 'size-6' }: Props) => {
    return (
        <div
            className={`pointer-events-none border-current inline-block relative before:block before:absolute before:w-full before:h-full before:rounded-full before:border-solid before:border-2 before:border-t-current before:border-r-current before:border-b-transparent before:border-l-transparent before:animate-spin ${className}`}>
            <span className="sr-only">Spinner</span>
        </div>
    )
}
