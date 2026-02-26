import { useState } from "react";

export default function AddTaskForm({ columnId, onAdd, darkMode }) {
    const [text, setText] = useState("");
    const [priority, setPriority] = useState("medium");
    const [open, setOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(columnId, text.trim(), priority);
        setText("");
        setPriority("medium");
        setOpen(false);
    };

    if (!open) {
        return (
            <button className="add-btn" onClick={() => setOpen(true)}>
                + Add Task
            </button>
        );
    }

    return (
        <form className={`add-form ${darkMode ? "dark" : ""}`} onSubmit={handleSubmit}>
            <input
                autoFocus
                className="add-input"
                placeholder="Task description..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <select
                className="add-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
            >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
            </select>
            <div className="add-actions">
                <button type="submit" className="btn-confirm">Add</button>
                <button type="button" className="btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
            </div>
        </form>
    );
}