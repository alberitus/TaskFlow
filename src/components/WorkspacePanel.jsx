import { useState } from "react";
import ActivityLog from "./ActivityLog";
import OnlinePresence from "./OnlinePresence";

export default function WorkspacePanel({
    user, workspace, myWorkspaces, onCreate, onJoin, onLeave, onSwitch,
    onDelete, onBulkDelete,
    loading, error, darkMode, activities, onlineMembers
}) {
    const [mode, setMode] = useState(null);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [showActivity, setShowActivity] = useState(false);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState([]);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

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

    const toggleSelect = (id) => {
        setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = () => {
        onBulkDelete(selected);
        setSelected([]);
        setSelectMode(false);
        setConfirmBulkDelete(false);
        setMode(null);
    };

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelected([]);
        setConfirmBulkDelete(false);
    };

    const renderWsList = (inPanel = false) => (
        <>
        <div className="ws-list">
            {myWorkspaces.map((ws) => {
                const isOwner = ws.ownerId === user?.uid;
                const isSelected = selected.includes(ws.id);
                const isActive = workspace?.id === ws.id;
                return (
                    <div
                    key={ws.id}
                    className={`ws-list-item ${isActive ? "active" : ""} ${darkMode ? "dark" : ""} ${isSelected ? "ws-selected" : ""}`}
                    onClick={() => {
                        if (selectMode) {
                        if (isOwner) toggleSelect(ws.id);
                        } else {
                        onSwitch(ws);
                        setMode(null);
                        }
                    }}
                    >
                        {selectMode && (
                            <div className={`ws-checkbox ${isSelected ? "checked" : ""} ${!isOwner ? "disabled" : ""}`}>
                            {isSelected && <i className="bi bi-check2"></i>}
                            </div>
                        )}
                        <div className="ws-list-avatar">{ws.name[0].toUpperCase()}</div>
                        <div className="ws-list-info">
                            <span className="ws-list-name">{ws.name}</span>
                            <span className="ws-list-meta">
                            {Object.keys(ws.members || {}).length} member · {ws.id}
                            {isOwner
                                ? <span className="ws-owner-badge">Owner</span>
                                : <span className="ws-owner-badge" style={{ background: "#f1f5f9", color: "#94a3b8" }}>Member</span>
                            }
                            {!isOwner && selectMode && (
                                <span style={{ color: "#cbd5e1", fontSize: "0.7rem" }}> · tidak bisa dihapus</span>
                            )}
                            </span>
                        </div>
                        {!selectMode && isActive && (
                            <i className="bi bi-check2-circle" style={{ color: "#6366f1", marginLeft: "auto" }}></i>
                        )}
                        {!selectMode && isOwner && (
                            <button
                            className="subtask-delete"
                            title="Hapus workspace"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Hapus workspace "${ws.name}"?`)) onDelete(ws.id);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Konfirmasi bulk delete */}
        {confirmBulkDelete && (
            <div className={`bulk-confirm ${darkMode ? "dark" : ""}`}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: "#ef4444" }}></i>
                <span>Hapus <strong>{selected.length}</strong> workspace? Aksi ini tidak bisa dibatalkan.</span>
                <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <button className="btn-cancel" style={{ padding: "6px 12px" }} onClick={() => setConfirmBulkDelete(false)}>Batal</button>
                    <button className="btn-logout-confirm" onClick={handleBulkDelete}>Ya, Hapus</button>
                </div>
            </div>
        )}
        </>
    );

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
                    {myWorkspaces.length >= 1 && (
                    <button className="ws-btn" onClick={() => { setMode(mode === "list" ? null : "list"); exitSelectMode(); }}>
                        <i className="bi bi-grid"></i> Workspaces ({myWorkspaces.length})
                    </button>
                    )}
                    <button className="ws-btn" onClick={() => setShowActivity(!showActivity)}>
                        <i className="bi bi-clock-history"></i> Activity
                    </button>
                    <button className="workspace-leave" onClick={onLeave}>
                        <i className="bi bi-box-arrow-left"></i> Keluar
                    </button>
                </div>
            </div>

            {/* Panel list workspace */}
            {mode === "list" && (
            <div className={`ws-list-panel ${darkMode ? "dark" : ""}`}>
                <div className="ws-list-header">
                    <span>Workspace kamu</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        {!selectMode ? (
                        <>
                            <button className="ws-btn" onClick={() => setMode("create")}>+ Buat</button>
                            <button className="ws-btn" onClick={() => setMode("join")}>Gabung</button>
                            <button className="ws-btn" onClick={() => setSelectMode(true)}>
                            <i className="bi bi-check2-square"></i> Pilih
                            </button>
                        </>
                        ) : (
                        <>
                            <span style={{ fontSize: "0.82rem", color: "#64748b", alignSelf: "center" }}>
                            {selected.length} dipilih
                            </span>
                            <button className="ws-btn" onClick={() => {
                            const ownerIds = myWorkspaces.filter((ws) => ws.ownerId === user?.uid).map((ws) => ws.id);
                            setSelected(ownerIds);
                            }}>Pilih Semua</button>
                            {selected.length > 0 && (
                            <button className="toolbar-btn reset" onClick={() => setConfirmBulkDelete(true)}>
                                <i className="bi bi-trash"></i> Hapus ({selected.length})
                            </button>
                            )}
                            <button className="btn-cancel" style={{ padding: "6px 12px" }} onClick={exitSelectMode}>Batal</button>
                        </>
                        )}
                    </div>
                </div>

                {renderWsList(true)}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="btn-cancel" style={{ padding: "6px 12px", marginLeft: "auto" }}
                        onClick={() => { setMode(null); exitSelectMode(); }}>Tutup</button>
                </div>
            </div>
            )}

            {/* Form create/join dari dalam panel */}
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
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>Pilih Workspace</span>
                        {!selectMode ? (
                            <button className="ws-btn" onClick={() => setSelectMode(true)}>
                            <i className="bi bi-check2-square"></i> Pilih
                            </button>
                        ) : (
                            <>
                            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>{selected.length} dipilih</span>
                            <button className="ws-btn" onClick={() => {
                                const ownerIds = myWorkspaces.filter((ws) => ws.ownerId === user?.uid).map((ws) => ws.id);
                                setSelected(ownerIds);
                            }}>Pilih Semua</button>
                            {selected.length > 0 && (
                                <button className="toolbar-btn reset" onClick={() => setConfirmBulkDelete(true)}>
                                <i className="bi bi-trash"></i> Hapus ({selected.length})
                                </button>
                            )}
                            <button className="btn-cancel" style={{ padding: "6px 12px" }} onClick={exitSelectMode}>Batal</button>
                            </>
                        )}
                    </div>
                    <button className="modal-close-btn" onClick={() => { setMode(null); exitSelectMode(); }}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {renderWsList()}

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="ws-btn" onClick={() => setMode("create")}>+ Buat Baru</button>
                    <button className="ws-btn" onClick={() => setMode("join")}>Gabung Kode</button>
                    <button className="btn-cancel" style={{ padding: "6px 12px" }} onClick={() => { setMode(null); exitSelectMode(); }}>Tutup</button>
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