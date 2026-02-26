import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";

export default function Column({ column, tasks, onAdd, onDelete, onDeleteColumn, isDefault, darkMode }) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const color = column.color || "#6366f1";

    const countStyle = {
        background: `${color}22`,
        color: color,
    };

    return (
        <div
            className={`column ${darkMode ? "dark" : ""} ${isOver ? "over" : ""}`}
            style={{ borderTop: `3px solid ${color}` }}
            >
            <div className="column-header">
                <h2 className="column-title" style={{ color }}>{column.title}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="task-count" style={countStyle}>{tasks.length}</span>
                    {!isDefault && (
                        <button
                        className="delete-btn"
                        title="Delete board"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onDeleteColumn(column.id)}
                        >
                        ×
                        </button>
                    )}
                </div>
            </div>

            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="task-list">
                    {tasks.length === 0 && <div className="empty-state">Drop tasks here</div>}
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={onDelete} darkMode={darkMode} />
                    ))}
                </div>
            </SortableContext>

            <AddTaskForm columnId={column.id} onAdd={onAdd} darkMode={darkMode} />
        </div>
    );
}