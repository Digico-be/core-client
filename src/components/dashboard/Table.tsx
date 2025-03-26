import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { cva, VariantProps } from 'class-variance-authority'

import { DndContainer } from './Droppable'

type Props = {
    children: React.ReactNode
    items: any[]
    intent?: Variants['intent']
    className?: string
    isLoading?: boolean
    sortable?: boolean
    onDragEnd?: any
}

const style = cva('', {
    variants: {
        intent: {
            white: 'table-white'
        }
    },
    defaultVariants: {
        intent: 'white'
    }
})

type Variants = VariantProps<typeof style>

type PropsItem = {
    name?: string
    children?: React.ReactNode | ((item: any, index?: number) => React.ReactNode)
    item?: Record<string, any>
    index?: number
    className?: string
}

const getNestedValue = (key: string, obj: Record<string, any>): any => {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj)
}

const Item = ({ children, name, item, index, ...props }: PropsItem) => {
    const content = typeof children === 'function' && item ? children(item, index) : name && item ? getNestedValue(name, item) : children

    return <td {...props}>{content}</td>
}

const Head = ({ children }: { children?: React.ReactNode }) => {
    return <th>{children}</th>
}

const ItemSortable = ({ children, item }: any) => {
    const { setNodeRef, transform, transition } = useSortable({ id: item.id })

    return (
        <tr
            ref={setNodeRef}
            style={{
                transform: transform ? `translate(${transform.x}px, ${transform.y}px) scale(${transform.scaleX}, ${transform.scaleY})` : 'none',
                transition: transition ?? 'none'
            }}>
            {children}
        </tr>
    )
}

const Table = ({ title, children, items, intent, className, sortable, onDragEnd }: Props & { title?: string }) => {
    if (!items || items.length === 0) {
        return (
            <>
                {title && <h1 className="text-md font-bold mb-12">{title}</h1>}
                <table className={style({ intent, className })}>
                    <thead>
                        <tr>{React.Children.toArray(children).filter((child) => React.isValidElement(child) && child.type === Head)}</tr>
                    </thead>
                </table>
                <p className="py-8 text-xs text-center text-grey-800">Aucun élément dans le tableau !</p>
            </>
        )
    }

    if (sortable) {
        return (
            <DndContainer onDragEnd={onDragEnd}>
                <DndContainer.SortableContainer items={items}>
                    {title && <h1 className="text-md font-bold mb-12">{title}</h1>}
                    <table className={style({ intent, className })}>
                        <thead>
                            <tr>{React.Children.toArray(children).filter((child) => React.isValidElement(child) && child.type === Head)}</tr>
                        </thead>
                        <tbody>
                        {items.map((item, rowIndex) => {
                            return (
                                <ItemSortable key={item.id} item={item} rowIndex={rowIndex}>
                                    <td>
                                        <DndContainer.ButtonSort className="size-4" id={item.id} />
                                    </td>
                                    {React.Children.map(children, (child) => {
                                        if (!React.isValidElement(child) || child.type !== Item) {
                                            return null
                                        }

                                        return React.cloneElement(child as React.ReactElement<{ item: any }>, { item: item })
                                    })}
                                </ItemSortable>
                            )
                        })}
                        </tbody>
                    </table>
                </DndContainer.SortableContainer>
            </DndContainer>
        )
    }

    return (
        <>
            {title && <h1 className="text-md font-bold mb-12">{title}</h1>}
            <table className={style({ intent, className })}>
                <thead>
                    <tr>{React.Children.toArray(children).filter((child) => React.isValidElement(child) && child.type === Head)}</tr>
                </thead>
                <tbody>
                {items.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                        {React.Children.map(children, (child) => {
                            if (!React.isValidElement(child) || child.type !== Item) {
                                return null
                            }

                            return React.cloneElement(child as React.ReactElement<{ index: number; item: any }>, { index: rowIndex, item: item })
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

Table.Head = Head
Table.Item = Item

export { Table }
