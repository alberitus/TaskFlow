import { useState, useRef, useEffect } from "react";

const PRIORITIES = [
    { value: "high", label: "High", color: "#ef4444", bg: "#fef2f2" },
    { value: "medium", label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
    { value: "low", label: "Low", color: "#22c55e", bg: "#f0fdf4" },
];

export default function AddTaskForm({ columnId, onAdd, darkMode }) {
    const [text, setText] = useState("");
    const [priority, setPriority] = useState("medium");
    const [open, setOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selected = PRIORITIES.find((p) => p.value === priority);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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

            {/* Custom Dropdown */}
            <div className="custom-select-wrap" ref={dropdownRef}>
                <button
                type="button"
                className={`custom-select-trigger ${darkMode ? "dark" : ""} ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <span className="custom-select-dot" style={{ background: selected.color }} />
                    <span className="custom-select-label">{selected.label}</span>
                    <i className={`bi bi-chevron-down custom-select-arrow ${dropdownOpen ? "rotated" : ""}`} />
                </button>

                {dropdownOpen && (
                    <div className={`custom-select-dropdown ${darkMode ? "dark" : ""}`}>
                        {PRIORITIES.map((p) => (
                        <div
                            key={p.value}
                            className={`custom-select-option ${priority === p.value ? "active" : ""} ${darkMode ? "dark" : ""}`}
                            onClick={() => { setPriority(p.value); setDropdownOpen(false); }}
                            style={{ "--opt-color": p.color, "--opt-bg": p.bg }}
                        >
                            <span className="custom-select-dot" style={{ background: p.color }} />
                            <span>{p.label}</span>
                            {priority === p.value && <i className="bi bi-check2 ms-auto" style={{ color: p.color }} />}
                        </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="add-actions">
                <button type="submit" className="btn-confirm">Add</button>
                <button type="button" className="btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
            </div>
        </form>
    );
}