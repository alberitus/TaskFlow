import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";

export default function Column({ column, tasks, onAdd, onDelete, onOpen, onDeleteColumn, onRenameColumn, isDefault, darkMode }) {
const { setNodeRef, isOver } = useDroppable({ id: column.id });
const color = column.color || "#6366f1";
const countStyle = { background: `${color}22`, color };

const [renaming, setRenaming] = useState(false);
const [newTitle, setNewTitle] = useState(column.title);

const handleRename = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onRenameColumn(column.id, newTitle.trim());
    setRenaming(false);
};

    return (
        <div className={`column ${darkMode ? "dark" : ""} ${isOver ? "over" : ""}`}
        style={{ borderTop: `3px solid ${color}` }} >
            <div className="column-header">
                {renaming ? (
                    <form onSubmit={handleRename} style={{ flex: 1, display: "flex", gap: 6 }}>
                        <input
                        autoFocus
                        className={`add-input ${darkMode ? "dark" : ""}`}
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: "0.9rem" }}
                        />
                        <button type="submit" className="btn-confirm" style={{ padding: "4px 10px", flex: "none" }}>✓</button>
                        <button type="button" className="btn-cancel" style={{ padding: "4px 10px", flex: "none" }} onClick={() => { setRenaming(false); setNewTitle(column.title); }}>✕</button>
                    </form>
                ) : (
                <>
                    <h2 className="column-title" style={{ color, cursor: "pointer" }}
                    onDoubleClick={() => setRenaming(true)} title="Double-click untuk rename">
                    {column.title}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="task-count" style={countStyle}>{tasks.length}</span>
                        <button className="delete-btn" title="Rename board" onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setRenaming(true)}>
                            <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }}></i>
                        </button>
                        {!isDefault && (
                            <button className="delete-btn" title="Delete board"
                            onPointerDown={(e) => e.stopPropagation()} onClick={() => onDeleteColumn(column.id)}>
                                ×
                            </button>
                        )}
                    </div>
                </>
                )}
            </div>

            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="task-list">
                    {tasks.length === 0 && <div className="empty-state">Drop tasks here</div>}
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={onDelete} onOpen={onOpen} darkMode={darkMode} />
                    ))}
                </div>
            </SortableContext>

            <AddTaskForm columnId={column.id} onAdd={onAdd} darkMode={darkMode} />
        </div>
    );
}