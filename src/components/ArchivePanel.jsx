export default function ArchivePanel({ tasks, columns, onUnarchive, onDelete, darkMode }) {
    const archived = tasks.filter((t) => t.archived);

    if (archived.length === 0) {
        return (
            <div className={`archive-panel ${darkMode ? "dark" : ""}`}>
                <div className="archive-empty">
                    <i className="bi bi-archive" style={{ fontSize: "2rem", color: "#cbd5e1" }}></i>
                    <p>Tidak ada task yang diarsipkan.</p>
                </div>
            </div>
        );
    }

    const priorityConfig = {
        high: { label: "High", color: "#ef4444" },
        medium: { label: "Medium", color: "#f59e0b" },
        low: { label: "Low", color: "#22c55e" },
    };

    return (
        <div className={`archive-panel ${darkMode ? "dark" : ""}`}>
            <div className="archive-header">
                <i className="bi bi-archive-fill"></i> Task Diarsipkan ({archived.length})
            </div>
            <div className="archive-list">
                {archived.map((task) => {
                    const col = columns.find((c) => c.id === task.columnId);
                    const p = priorityConfig[task.priority];
                    return (
                    <div key={task.id} className={`archive-item ${darkMode ? "dark" : ""}`}>
                        <div className="archive-item-info">
                            <span className="archive-item-text">{task.text}</span>
                            <div className="archive-item-meta">
                                {col && <span className="archive-col-badge" style={{ background: `${col.color}22`, color: col.color }}>{col.title}</span>}
                                <span className="priority-badge" style={{ color: p.color, borderColor: p.color, fontSize: "0.7rem" }}>{p.label}</span>
                            </div>
                        </div>
                        <div className="archive-item-actions">
                            <button className="ws-btn" onClick={() => onUnarchive(task.id)} title="Kembalikan task">
                                <i className="bi bi-arrow-counterclockwise"></i> Pulihkan
                            </button>
                            <button className="subtask-delete" onClick={() => onDelete(task.id)} title="Hapus permanen">
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}