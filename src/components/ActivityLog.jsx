import { useState } from "react";

function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
}

export default function ActivityLog({ activities, darkMode, onClose }) {
    return (
        <div className={`activity-panel ${darkMode ? "dark" : ""}`}>
            <div className="activity-header">
                <h3><i className="bi bi-clock-history"></i> Activity Log</h3>
                <button className="modal-close-btn" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
            <div className="activity-list">
                {activities.length === 0 && (
                    <div className="activity-empty">Belum ada aktivitas.</div>
                )}
                {activities.map((a) => (
                    <div key={a.id} className={`activity-item ${darkMode ? "dark" : ""}`}>
                        <div className="activity-avatar">
                            {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="activity-content">
                            <span className="activity-name">{a.name}</span>
                            <span className="activity-action"> {a.action}</span>
                            {a.detail && <span className="activity-detail"> "{a.detail}"</span>}
                            <div className="activity-time">{timeAgo(a.createdAt)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}