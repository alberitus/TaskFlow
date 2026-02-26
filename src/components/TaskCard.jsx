import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityConfig = {
    high: { label: "High", color: "#ef4444" },
    medium: { label: "Medium", color: "#f59e0b" },
    low: { label: "Low", color: "#22c55e" },
};

export default function TaskCard({ task, onDelete, darkMode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const p = priorityConfig[task.priority];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-card ${darkMode ? "dark" : ""} ${isDragging ? "dragging" : ""}`}
            {...attributes}
            {...listeners}
            >
            <div className="task-top">
                <span className="task-text">{task.text}</span>
                <button
                className="delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                >
                ×
                </button>
            </div>
            <div className="task-bottom">
                <span className="priority-badge" style={{ color: p.color, borderColor: p.color }}>
                    {p.label}
                </span>
            </div>
        </div>
    );
}