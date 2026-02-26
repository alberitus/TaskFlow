import { useState } from "react";

export default function WorkspacePanel({ user, workspace, onCreate, onJoin, onLeave, loading, error, darkMode }) {
    const [mode, setMode] = useState(null);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim());
        setName("");
        setMode(null);
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        onJoin(code.trim());
        setCode("");
        setMode(null);
    };

    if (workspace) {
        return (
            <div className={`workspace-bar ${darkMode ? "dark" : ""}`}>
                <div className="workspace-info">
                <i className="bi bi-people-fill"></i>
                <span className="workspace-name">{workspace.name}</span>
                <span className="workspace-code">Kode: <strong>{workspace.id}</strong></span>
                </div>
                <button className="workspace-leave" onClick={onLeave}>
                <i className="bi bi-box-arrow-left"></i> Keluar
                </button>
            </div>
        );
    }

    return (
        <div className={`workspace-bar ${darkMode ? "dark" : ""}`}>
            {!mode ? (
                <div className="workspace-actions">
                    <span className="workspace-hint"><i className="bi bi-people"></i> Kolaborasi:</span>
                    <button className="ws-btn" onClick={() => setMode("create")}>+ Buat Workspace</button>
                    <button className="ws-btn" onClick={() => setMode("join")}>Gabung dengan Kode</button>
                </div>
            ) : mode === "create" ? (
                <form className="workspace-form" onSubmit={handleCreate}>
                    <input
                        autoFocus
                        className="add-input"
                        placeholder="Nama workspace..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        {loading ? "..." : "Buat"}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => setMode(null)}>Batal</button>
                    {error && <span className="ws-error">{error}</span>}
                </form>
            ) : (
                <form className="workspace-form" onSubmit={handleJoin}>
                    <input
                        autoFocus
                        className="add-input"
                        placeholder="Masukkan kode workspace..."
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        style={{ textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}
                    />
                    <button type="submit" className="btn-confirm" disabled={loading}>
                        {loading ? "..." : "Gabung"}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => setMode(null)}>Batal</button>
                    {error && <span className="ws-error">{error}</span>}
                </form>
            )}
        </div>
    );
}