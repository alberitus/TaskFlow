import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityConfig = {
    high: { label: "High", color: "#ef4444" },
    medium: { label: "Medium", color: "#f59e0b" },
    low: { label: "Low", color: "#22c55e" },
};

export default function TaskCard({ task, onDelete, onOpen, darkMode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const p = priorityConfig[task.priority];
    const doneCount = (task.subtasks || []).filter((s) => s.done).length;
    const totalSubtasks = (task.subtasks || []).length;
    const progress = totalSubtasks > 0 ? Math.round((doneCount / totalSubtasks) * 100) : 0;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const isDueSoon = task.dueDate && !isOverdue && (new Date(task.dueDate) - new Date()) < 86400000 * 2;

    const formatDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    return (
        <div
        ref={setNodeRef}
        style={style}
        className={`task-card ${darkMode ? "dark" : ""} ${isDragging ? "dragging" : ""}`}
        {...attributes}
        {...listeners}
        onClick={() => onOpen(task)}
        >
            <div className="task-top">
                <span className="task-text">{task.text}</span>
                <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                onPointerDown={(e) => e.stopPropagation()}
                >×</button>
            </div>

            {/* Subtask progress bar */}
            {totalSubtasks > 0 && (
                <div className="card-subtask-wrap">
                    <div className="card-subtask-bar">
                        <div className="card-subtask-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="card-subtask-count">{doneCount}/{totalSubtasks}</span>
                </div>
            )}

            <div className="task-bottom">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span className="priority-badge" style={{ color: p.color, borderColor: p.color }}>
                        {p.label}
                    </span>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {/* Assignees avatars */}
                        {(task.assignees || []).length > 0 && (
                            <div className="card-assignees">
                                {task.assignees.slice(0, 3).map((a) => (
                                    <div key={a.uid} className="card-assignee-avatar" title={a.name}>
                                        {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Due date */}
                        {task.dueDate && (
                            <span className={`card-due ${isOverdue ? "overdue" : isDueSoon ? "due-soon" : ""}`}>
                                <i className="bi bi-calendar2"></i> {formatDate(task.dueDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}