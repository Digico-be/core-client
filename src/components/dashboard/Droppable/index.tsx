import {
    Announcements,
    CancelDrop,
    CollisionDetection,
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
    Modifiers,
    ScreenReaderInstructions,
    SensorDescriptor
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, SortingStrategy, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { Icon } from '@components/Icon'

interface DndContainerProps {
    announcements?: Announcements
    autoScroll?: boolean
    cancelDrop?: CancelDrop
    children?: React.ReactNode
    collisionDetection?: CollisionDetection
    modifiers?: Modifiers
    screenReaderInstructions?: ScreenReaderInstructions
    sensors?: SensorDescriptor<any>[]
    onDragStart?(event: DragStartEvent): void
    onDragMove?(event: DragMoveEvent): void
    onDragOver?(event: DragOverEvent): void
    onDragEnd?(event: DragEndEvent): void
    onDragCancel?(): void
}

interface SortableContainerProps {
    items: any[]
    children: React.ReactNode
    strategy?: SortingStrategy
}

interface SortableItemProps {
    id: string | number
    children: React.ReactNode
}

const DndContainer = ({ children, ...props }: DndContainerProps) => {
    return (
        <DndContext modifiers={[restrictToVerticalAxis]} {...props}>
            {children}
        </DndContext>
    )
}

const SortableContainer = ({ children, ...props }: SortableContainerProps) => {
    return (
        <SortableContext strategy={verticalListSortingStrategy} {...props}>
            {children}
        </SortableContext>
    )
}

const SortableItem = ({ id, children }: SortableItemProps) => {
    const { setNodeRef, transform, transition } = useSortable({ id: id })

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: transform ? `translate(${transform.x}px, ${transform.y}px) scale(${transform.scaleX}, ${transform.scaleY})` : 'none',
                transition: transition ?? 'none'
            }}>
            {children}
        </div>
    )
}

const ButtonSort = ({ id, className }: any) => {
    const { attributes, listeners } = useSortable({ id: id })
    return (
        <button {...attributes} {...listeners} className={`hover:text-primary transition-all ${className}`}>
            <Icon name="sort" className="fill-current size-full" />
        </button>
    )
}

DndContainer.SortableContainer = SortableContainer
DndContainer.SortableItem = SortableItem
DndContainer.ButtonSort = ButtonSort

export { DndContainer }
