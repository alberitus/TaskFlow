export default function DeadlineTracker({ tasks, darkMode }) {
    const now = new Date();

    const tracked = tasks.filter((t) => !t.archived && t.dueDate && t.columnId !== "done").map((t) => {
        const due = new Date(t.dueDate);
        const created = new Date(t.createdAt || due - 86400000 * 7);
        const totalMs = due - created;
        const elapsed = now - created;
        const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalMs) * 100)));
        const isOverdue = due < now;
        const isDueSoon = !isOverdue && (due - now) < 86400000 * 2;
        const daysLeft = Math.ceil((due - now) / 86400000);
        return { ...t, pct, isOverdue, isDueSoon, daysLeft };
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 10);

    if (tracked.length === 0) return null;

    const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

    return (
        <div className={`deadline-panel ${darkMode ? "dark" : ""}`}>
            <div className="deadline-header">
                <i className="bi bi-clock"></i> Deadline Tracker
                <span className="deadline-count">{tracked.length} task</span>
            </div>
            <div className="deadline-list">
                {tracked.map((t) => (
                    <div key={t.id} className={`deadline-item ${darkMode ? "dark" : ""}`}>
                        <div className="deadline-item-top">
                            <span className="deadline-task-name">{t.text}</span>
                            <span className={`deadline-badge ${t.isOverdue ? "overdue" : t.isDueSoon ? "soon" : ""}`}>
                            {t.isOverdue
                                ? `${Math.abs(t.daysLeft)}h overdue`
                                : t.daysLeft === 0
                                ? "Hari ini!"
                                : `${t.daysLeft}h lagi`}
                            </span>
                        </div>
                        <div className="deadline-track">
                            <div
                            className="deadline-fill"
                            style={{
                                width: `${t.pct}%`,
                                background: t.isOverdue ? "#ef4444" : t.isDueSoon ? "#f59e0b" : priorityColor[t.priority],
                            }}
                            />
                        </div>
                        <div className="deadline-meta">
                            <span style={{ color: priorityColor[t.priority], fontSize: "0.7rem", fontWeight: 600 }}>
                            {t.priority.toUpperCase()}
                            </span>
                            <span>
                            {new Date(t.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}