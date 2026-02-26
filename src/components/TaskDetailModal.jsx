import { useState, useEffect } from "react";
import { useComments } from "../hooks/useComments";

const PRIORITIES = [
    { value: "high", label: "High", color: "#ef4444", bg: "#fef2f2" },
    { value: "medium", label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
    { value: "low", label: "Low", color: "#22c55e", bg: "#f0fdf4" },
];

export default function TaskDetailModal({ task, columns, members, onUpdate, onDelete, onClose, darkMode, workspaceId, user }) {
    const [text, setText] = useState(task.text);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState(task.dueDate || "");
    const [subtasks, setSubtasks] = useState(task.subtasks || []);
    const [assignees, setAssignees] = useState(task.assignees || []);
    const [newSubtask, setNewSubtask] = useState("");
    const [priorityOpen, setPriorityOpen] = useState(false);
    const { comments, addComment, deleteComment } = useComments(workspaceId, task.id);
    const [commentText, setCommentText] = useState("");

    const selectedPriority = PRIORITIES.find((p) => p.value === priority);

    const handleSave = () => {
        onUpdate(task.id, { text, description, priority, dueDate, subtasks, assignees });
    };

    const addSubtask = (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        const updated = [...subtasks, { id: `st-${Date.now()}`, text: newSubtask.trim(), done: false }];
        setSubtasks(updated);
        setNewSubtask("");
        onUpdate(task.id, { subtasks: updated });
    };

    const toggleSubtask = (id) => {
        const updated = subtasks.map((s) => s.id === id ? { ...s, done: !s.done } : s);
        setSubtasks(updated);
        onUpdate(task.id, { subtasks: updated });
    };

    const deleteSubtask = (id) => {
        const updated = subtasks.filter((s) => s.id !== id);
        setSubtasks(updated);
        onUpdate(task.id, { subtasks: updated });
    };

    const toggleAssignee = (uid, name) => {
        const exists = assignees.find((a) => a.uid === uid);
        const updated = exists
        ? assignees.filter((a) => a.uid !== uid)
        : [...assignees, { uid, name }];
        setAssignees(updated);
        onUpdate(task.id, { assignees: updated });
    };

    const doneCount = subtasks.filter((s) => s.done).length;
    const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

    const isDueSoon = () => {
        if (!dueDate) return false;
        const diff = new Date(dueDate) - new Date();
        return diff > 0 && diff < 86400000 * 2;
    };

    const isOverdue = () => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        addComment(user, commentText);
        setCommentText("");
    };
    
    const renderComment = (text) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) =>
            part.startsWith("@")
            ? <span key={i} className="mention">{part}</span>
            : part
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`task-modal ${darkMode ? "dark" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="task-modal-header">
                    <input
                        className={`task-modal-title-input ${darkMode ? "dark" : ""}`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleSave}
                        placeholder="Task title..."
                    />
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="task-modal-body">
                    {/* Left Column */}
                    <div className="task-modal-left">

                        {/* Description */}
                        <div className="task-section">
                            <label className="task-section-label">
                                <i className="bi bi-text-left"></i> Description
                            </label>
                            <textarea
                                className={`task-textarea ${darkMode ? "dark" : ""}`}
                                placeholder="Add a description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={handleSave}
                                rows={4}
                            />
                        </div>

                        {/* Subtasks */}
                        <div className="task-section">
                            <label className="task-section-label">
                                <i className="bi bi-check2-square"></i> Subtasks
                                {subtasks.length > 0 && (
                                <span className="subtask-count">{doneCount}/{subtasks.length}</span>
                                )}
                            </label>

                            {subtasks.length > 0 && (
                                <div className="subtask-progress">
                                    <div className="subtask-progress-bar" style={{ width: `${progress}%` }} />
                                </div>
                            )}

                            <div className="subtask-list">
                                {subtasks.map((s) => (
                                    <div key={s.id} className={`subtask-item ${darkMode ? "dark" : ""}`}>
                                        <input
                                        type="checkbox"
                                        checked={s.done}
                                        onChange={() => toggleSubtask(s.id)}
                                        className="subtask-checkbox"
                                        />
                                        <span className={`subtask-text ${s.done ? "done" : ""}`}>{s.text}</span>
                                        <button
                                        className="subtask-delete"
                                        onClick={() => deleteSubtask(s.id)}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <form className="subtask-form" onSubmit={addSubtask}>
                                <input
                                className={`add-input ${darkMode ? "dark" : ""}`}
                                placeholder="Add subtask..."
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                />
                                <button type="submit" className="btn-confirm" style={{ padding: "7px 14px", flex: "none" }}>
                                    <i className="bi bi-plus"></i>
                                </button>
                            </form>
                        </div>

                        {/* Comments */}
                        {workspaceId && (
                            <div className="task-section">
                                <label className="task-section-label">
                                    <i className="bi bi-chat-dots"></i> Comments
                                    {comments.length > 0 && <span className="subtask-count">{comments.length}</span>}
                                </label>

                                <div className="comment-list">
                                    {comments.map((c) => (
                                        <div key={c.id} className={`comment-item ${darkMode ? "dark" : ""}`}>
                                            <div className="comment-avatar">
                                                {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-meta">
                                                    <span className="comment-name">{c.name}</span>
                                                    <span className="comment-time">
                                                        {new Date(c.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                    {user && c.uid === user.uid && (
                                                        <button className="comment-delete" onClick={() => deleteComment(c.id)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="comment-text">{renderComment(c.text)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {user ? (
                                <form className="comment-form" onSubmit={handleAddComment}>
                                    <input
                                    className={`add-input ${darkMode ? "dark" : ""}`}
                                    placeholder="Tulis komentar... (gunakan @nama untuk mention)"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    />
                                    <button type="submit" className="btn-confirm" style={{ padding: "7px 14px", flex: "none" }}>
                                        <i className="bi bi-send"></i>
                                    </button>
                                </form>
                                ) : (
                                    <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Login untuk berkomentar.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="task-modal-right">

                        {/* Priority */}
                        <div className="task-section">
                            <label className="task-section-label">
                                <i className="bi bi-flag"></i> Priority
                            </label>
                            <div className="custom-select-wrap" style={{ position: "relative" }}>
                                <button
                                type="button"
                                className={`custom-select-trigger ${darkMode ? "dark" : ""} ${priorityOpen ? "open" : ""}`}
                                onClick={() => setPriorityOpen(!priorityOpen)}
                                >
                                    <span className="custom-select-dot" style={{ background: selectedPriority.color }} />
                                    <span className="custom-select-label">{selectedPriority.label}</span>
                                    <i className={`bi bi-chevron-down custom-select-arrow ${priorityOpen ? "rotated" : ""}`} />
                                </button>

                                {priorityOpen && (
                                    <div className={`custom-select-dropdown ${darkMode ? "dark" : ""}`}>
                                        {PRIORITIES.map((p) => (
                                            <div
                                                key={p.value}
                                                className={`custom-select-option ${priority === p.value ? "active" : ""} ${darkMode ? "dark" : ""}`}
                                                style={{ "--opt-color": p.color, "--opt-bg": p.bg }}
                                                onClick={() => {
                                                setPriority(p.value);
                                                setPriorityOpen(false);
                                                onUpdate(task.id, { priority: p.value });
                                                }}
                                            >
                                                <span className="custom-select-dot" style={{ background: p.color }} />
                                                <span>{p.label}</span>
                                                {priority === p.value && <i className="bi bi-check2 ms-auto" style={{ color: p.color }} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="task-section">
                            <label className="task-section-label">
                                <i className="bi bi-calendar"></i> Due Date
                            </label>
                            <input
                                type="date"
                                className={`add-input ${darkMode ? "dark" : ""} ${isOverdue() ? "overdue" : isDueSoon() ? "due-soon" : ""}`}
                                value={dueDate}
                                onChange={(e) => { setDueDate(e.target.value); onUpdate(task.id, { dueDate: e.target.value }); }}
                            />
                            {isOverdue() && <span className="due-warning overdue-text"><i className="bi bi-exclamation-circle"></i> Overdue!</span>}
                            {isDueSoon() && !isOverdue() && <span className="due-warning soon-text"><i className="bi bi-clock"></i> Due soon!</span>}
                        </div>

                        {/* Assignees */}
                        {members && Object.keys(members).length > 0 && (
                        <div className="task-section">
                            <label className="task-section-label">
                            <i className="bi bi-person"></i> Assignees
                            </label>
                            <div className="assignee-list">
                                {Object.entries(members).map(([uid, name]) => {
                                    const isAssigned = assignees.find((a) => a.uid === uid);
                                    const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                                    return (
                                        <div
                                            key={uid}
                                            className={`assignee-item ${isAssigned ? "assigned" : ""} ${darkMode ? "dark" : ""}`}
                                            onClick={() => toggleAssignee(uid, name)}
                                        >
                                            <div className="assignee-avatar" style={{ background: isAssigned ? "#6366f1" : "#cbd5e1" }}>
                                                {initials}
                                            </div>
                                            <span className="assignee-name">{name}</span>
                                            {isAssigned && <i className="bi bi-check2" style={{ color: "#6366f1", marginLeft: "auto" }}></i>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        )}

                        {/* Delete */}
                        <div className="task-section" style={{ marginTop: "auto" }}>
                            <button
                                className="btn-delete-task"
                                onClick={() => { onDelete(task.id); onClose(); }}
                            >
                                <i className="bi bi-trash"></i> Hapus Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}