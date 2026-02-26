import { useState } from "react";
import ActivityLog from "./ActivityLog";
import OnlinePresence from "./OnlinePresence";

function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
}

export default function WorkspacePanel({
    user, workspace, myWorkspaces, onCreate, onJoin, onLeave, onSwitch,
    loading, error, darkMode, activities, onlineMembers
}) {
    const [mode, setMode] = useState(null);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [showActivity, setShowActivity] = useState(false);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim());
        setName(""); setMode(null);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        onJoin(code.trim());
        setCode(""); setMode(null);
    };

    if (workspace) {
        return (
        <>
            <div className={`workspace-bar ${darkMode ? "dark" : ""}`}>
                <div className="workspace-info">
                    <i className="bi bi-people-fill"></i>
                    <span className="workspace-name">{workspace.name}</span>
                    <span className="workspace-code">Kode: <strong>{workspace.id}</strong></span>
                </div>

                <OnlinePresence onlineMembers={onlineMembers} darkMode={darkMode} />

                <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
                    {/* Switch workspace */}
                    {myWorkspaces.length > 1 && (
                        <div className="ws-switcher-wrap">
                            <button className="ws-btn" onClick={() => setMode(mode === "list" ? null : "list")}>
                                <i className="bi bi-grid"></i> Workspaces ({myWorkspaces.length})
                            </button>
                        </div>
                    )}
                    <button className="ws-btn" onClick={() => setShowActivity(!showActivity)}>
                        <i className="bi bi-clock-history"></i> Activity
                    </button>
                    <button className="workspace-leave" onClick={onLeave}>
                        <i className="bi bi-box-arrow-left"></i> Keluar
                    </button>
                </div>
            </div>

            {/* Dropdown list workspace */}
            {mode === "list" && (
                <div className={`ws-list-panel ${darkMode ? "dark" : ""}`}>
                    <div className="ws-list-header">
                        <span>Workspace kamu</span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="ws-btn" onClick={() => { setMode("create"); }}>+ Buat</button>
                            <button className="ws-btn" onClick={() => { setMode("join"); }}>Gabung</button>
                        </div>
                    </div>
                    <div className="ws-list">
                        {myWorkspaces.map((ws) => (
                            <div
                            key={ws.id}
                            className={`ws-list-item ${workspace?.id === ws.id ? "active" : ""} ${darkMode ? "dark" : ""}`}
                            onClick={() => { onSwitch(ws); setMode(null); }}
                            >
                                <div className="ws-list-avatar">
                                    {ws.name[0].toUpperCase()}
                                </div>
                                <div className="ws-list-info">
                                    <span className="ws-list-name">{ws.name}</span>
                                    <span className="ws-list-meta">
                                    {Object.keys(ws.members || {}).length} member · {ws.id}
                                    {ws.ownerId === user?.uid && <span className="ws-owner-badge">Owner</span>}
                                    </span>
                                </div>
                                {workspace?.id === ws.id && (
                                    <i className="bi bi-check2-circle" style={{ color: "#6366f1", marginLeft: "auto" }}></i>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Form create/join dalam mode list */}
            {(mode === "create" || mode === "join") && (
                <div className={`ws-list-panel ${darkMode ? "dark" : ""}`}>
                    <div className="ws-list-header">
                        <span>{mode === "create" ? "Buat Workspace Baru" : "Gabung Workspace"}</span>
                        <button className="modal-close-btn" onClick={() => setMode("list")}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <form className="workspace-form" style={{ padding: "12px 16px" }}
                        onSubmit={mode === "create" ? handleCreate : handleJoin}>
                        <input
                            autoFocus
                            className="add-input"
                            placeholder={mode === "create" ? "Nama workspace..." : "Kode workspace..."}
                            value={mode === "create" ? name : code}
                            onChange={(e) => mode === "create" ? setName(e.target.value) : setCode(e.target.value.toUpperCase())}
                            maxLength={mode === "join" ? 6 : undefined}
                            style={mode === "join" ? { textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 } : {}}
                        />
                        <button type="submit" className="btn-confirm" disabled={loading}>{loading ? "..." : mode === "create" ? "Buat" : "Gabung"}</button>
                        <button type="button" className="btn-cancel" onClick={() => setMode("list")}>Batal</button>
                        {error && <span className="ws-error">{error}</span>}
                    </form>
                </div>
            )}

            {showActivity && (
                <ActivityLog activities={activities} darkMode={darkMode} onClose={() => setShowActivity(false)} />
            )}
        </>
        );
    }

    return (
        <div className={`workspace-bar ${darkMode ? "dark" : ""}`}>
            {!mode ? (
                <div className="workspace-actions">
                    <span className="workspace-hint"><i className="bi bi-people"></i> Kolaborasi:</span>
                    {myWorkspaces.length > 0 && (
                        <button className="ws-btn" onClick={() => setMode("list")}>
                            <i className="bi bi-grid"></i> Workspace Saya ({myWorkspaces.length})
                        </button>
                    )}
                    <button className="ws-btn" onClick={() => setMode("create")}>+ Buat Workspace</button>
                    <button className="ws-btn" onClick={() => setMode("join")}>Gabung dengan Kode</button>
                </div>
            ) : mode === "list" ? (
                <div style={{ width: "100%" }}>
                    <div className="ws-list-header" style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>Pilih Workspace</span>
                        <button className="modal-close-btn" onClick={() => setMode(null)}><i className="bi bi-x-lg"></i></button>
                    </div>
                    <div className="ws-list" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {myWorkspaces.map((ws) => (
                        <div
                            key={ws.id}
                            className={`ws-list-item ${darkMode ? "dark" : ""}`}
                            style={{ cursor: "pointer", minWidth: 200 }}
                            onClick={() => { onSwitch(ws); setMode(null); }}
                        >
                            <div className="ws-list-avatar">{ws.name[0].toUpperCase()}</div>
                            <div className="ws-list-info">
                                <span className="ws-list-name">{ws.name}</span>
                                <span className="ws-list-meta">{Object.keys(ws.members || {}).length} member · {ws.id}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button className="ws-btn" onClick={() => setMode("create")}>+ Buat Baru</button>
                        <button className="ws-btn" onClick={() => setMode("join")}>Gabung Kode</button>
                        <button className="btn-cancel" style={{ padding: "6px 12px" }} onClick={() => setMode(null)}>Tutup</button>
                    </div>
                </div>
            ) : mode === "create" ? (
                <form className="workspace-form" onSubmit={handleCreate}>
                    <input autoFocus className="add-input" placeholder="Nama workspace..." value={name} onChange={(e) => setName(e.target.value)} />
                    <button type="submit" className="btn-confirm" disabled={loading}>{loading ? "..." : "Buat"}</button>
                    <button type="button" className="btn-cancel" onClick={() => setMode(null)}>Batal</button>
                    {error && <span className="ws-error">{error}</span>}
                </form>
            ) : (
                <form className="workspace-form" onSubmit={handleJoin}>
                    <input autoFocus className="add-input" placeholder="Masukkan kode workspace..." value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} style={{ textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }} />
                    <button type="submit" className="btn-confirm" disabled={loading}>{loading ? "..." : "Gabung"}</button>
                    <button type="button" className="btn-cancel" onClick={() => setMode(null)}>Batal</button>
                    {error && <span className="ws-error">{error}</span>}
                </form>
            )}
        </div>
    );
}