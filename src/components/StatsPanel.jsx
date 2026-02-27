export default function StatsPanel({ tasks, columns, darkMode, onClose }) {
    const total = tasks.filter((t) => !t.archived).length;
    const archived = tasks.filter((t) => t.archived).length;

    const byColumn = columns.map((col) => ({
        ...col,
        count: tasks.filter((t) => t.columnId === col.id && !t.archived).length,
    }));

    const byPriority = {
        high: tasks.filter((t) => t.priority === "high" && !t.archived).length,
        medium: tasks.filter((t) => t.priority === "medium" && !t.archived).length,
        low: tasks.filter((t) => t.priority === "low" && !t.archived).length,
    };

    const now = new Date();
    const overdue = tasks.filter((t) => !t.archived && t.dueDate && new Date(t.dueDate) < now).length;
    const dueSoon = tasks.filter((t) => {
        if (t.archived || !t.dueDate) return false;
        const diff = new Date(t.dueDate) - now;
        return diff > 0 && diff < 86400000 * 2;
    }).length;

    const doneCol = columns.find((c) => c.id === "done");
    const doneCount = doneCol ? tasks.filter((t) => t.columnId === "done" && !t.archived).length : 0;
    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const subtaskTotal = tasks.reduce((acc, t) => acc + (t.subtasks?.length || 0), 0);
    const subtaskDone = tasks.reduce((acc, t) => acc + (t.subtasks?.filter((s) => s.done).length || 0), 0);

    return (
        <div className={`stats-panel ${darkMode ? "dark" : ""}`}>
            <div className="stats-header">
                <h3><i className="bi bi-bar-chart-line"></i> Statistik Board</h3>
                <button className="modal-close-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>
            </div>
    
            <div className="stats-body">
                {/* Summary cards */}
                <div className="stats-cards">
                    <div className={`stats-card ${darkMode ? "dark" : ""}`}>
                        <div className="stats-card-value">{total}</div>
                        <div className="stats-card-label">Total Task</div>
                    </div>
                    <div className={`stats-card ${darkMode ? "dark" : ""}`} style={{ borderColor: "#22c55e" }}>
                        <div className="stats-card-value" style={{ color: "#22c55e" }}>{completionRate}%</div>
                        <div className="stats-card-label">Selesai</div>
                    </div>
                    <div className={`stats-card ${darkMode ? "dark" : ""}`} style={{ borderColor: "#ef4444" }}>
                        <div className="stats-card-value" style={{ color: "#ef4444" }}>{overdue}</div>
                        <div className="stats-card-label">Overdue</div>
                    </div>
                    <div className={`stats-card ${darkMode ? "dark" : ""}`} style={{ borderColor: "#f59e0b" }}>
                        <div className="stats-card-value" style={{ color: "#f59e0b" }}>{dueSoon}</div>
                        <div className="stats-card-label">Due Soon</div>
                    </div>
                    <div className={`stats-card ${darkMode ? "dark" : ""}`}>
                        <div className="stats-card-value">{archived}</div>
                        <div className="stats-card-label">Diarsipkan</div>
                    </div>
                    <div className={`stats-card ${darkMode ? "dark" : ""}`} style={{ borderColor: "#6366f1" }}>
                        <div className="stats-card-value" style={{ color: "#6366f1" }}>
                            {subtaskTotal > 0 ? `${subtaskDone}/${subtaskTotal}` : "-"}
                        </div>
                        <div className="stats-card-label">Subtask</div>
                    </div>
                </div>
        
                <div className="stats-grid">
                    {/* Per kolom */}
                    <div className={`stats-section ${darkMode ? "dark" : ""}`}>
                        <div className="stats-section-title">Task per Board</div>
                        {byColumn.map((col) => (
                            <div key={col.id} className="stats-bar-row">
                                <span className="stats-bar-label" style={{ color: col.color }}>{col.title}</span>
                                <div className="stats-bar-track">
                                    <div
                                    className="stats-bar-fill"
                                    style={{ width: total > 0 ? `${(col.count / total) * 100}%` : "0%", background: col.color }}
                                    />
                                </div>
                                <span className="stats-bar-count">{col.count}</span>
                            </div>
                        ))}
                    </div>
        
                    {/* Per priority */}
                    <div className={`stats-section ${darkMode ? "dark" : ""}`}>
                        <div className="stats-section-title">Task per Priority</div>
                        {[
                            { key: "high", label: "High", color: "#ef4444" },
                            { key: "medium", label: "Medium", color: "#f59e0b" },
                            { key: "low", label: "Low", color: "#22c55e" },
                        ].map((p) => (
                            <div key={p.key} className="stats-bar-row">
                                <span className="stats-bar-label" style={{ color: p.color }}>{p.label}</span>
                                <div className="stats-bar-track">
                                    <div
                                    className="stats-bar-fill"
                                    style={{ width: total > 0 ? `${(byPriority[p.key] / total) * 100}%` : "0%", background: p.color }}
                                    />
                                </div>
                                <span className="stats-bar-count">{byPriority[p.key]}</span>
                            </div>
                        ))}
                    </div>
                </div>
        
                {/* Completion progress */}
                <div className={`stats-section ${darkMode ? "dark" : ""}`}>
                    <div className="stats-section-title">Overall Completion</div>
                    <div className="stats-completion">
                        <div className="stats-completion-bar">
                            <div className="stats-completion-fill" style={{ width: `${completionRate}%` }} />
                        </div>
                        <span className="stats-completion-pct">{completionRate}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}