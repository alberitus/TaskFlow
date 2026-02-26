import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableColumn({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div {...listeners} className="column-drag-handle" title="Drag to reorder">
                ⠿
            </div>
            {children}
        </div>
    );
}