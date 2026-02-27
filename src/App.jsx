import { useState, useEffect, useRef } from "react";
import Board from "./components/Board";
import WorkspacePanel from "./components/WorkspacePanel";
import NotificationToast from "./components/NotificationToast";
import ShortcutHint from "./components/ShortcutHint";
import { useTasks } from "./hooks/useTasks";
import { useAuth } from "./hooks/useAuth";
import { useWorkspace } from "./hooks/useWorkspace";
import { usePresence } from "./hooks/usePresence";
import { useActivity } from "./hooks/useActivity";
import { useNotifications } from "./hooks/useNotifications";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState({});

  const { user, loading, login, logout } = useAuth();
  const { workspace, myWorkspaces, loading: wsLoading, error: wsError,
    createWorkspace, joinWorkspace, leaveWorkspace, switchWorkspace,
    deleteWorkspace, bulkDeleteWorkspace
  } = useWorkspace(user);
  const { onlineMembers } = usePresence(user, workspace?.id);
  const { activities, logActivity } = useActivity(user, workspace?.id);
  const { notifications, dismiss } = useNotifications(activities, user?.uid);

  const searchInputRef = useRef(null);

  useKeyboardShortcuts({
    onToggleDark: () => setDarkMode((d) => !d),
    onSearch: () => {
      const input = document.querySelector(".toolbar-search-input");
      if (input) input.focus();
    },
    onToggleArchive: () => {
      window.dispatchEvent(new CustomEvent("toggle-archive"));
    },
  });

  const {
    tasks, columns, ready,
    addTask, updateTask, deleteTask, moveTask,
    reorderTasks, addColumn, deleteColumn, reorderColumns,
    renameColumn, archiveTask, unarchiveTask,
  } = useTasks(user, workspace?.id, logActivity);

  useEffect(() => {
    if (!workspace?.id) { setWorkspaceMembers({}); return; }
    import("firebase/firestore").then(({ doc, getDoc }) => {
      import("./firebase").then(({ db }) => {
        getDoc(doc(db, "workspaces", workspace.id)).then((snap) => {
          if (snap.exists()) setWorkspaceMembers(snap.data().memberNames || {});
        });
      });
    });
  }, [workspace]);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  if (loading || !ready) {
    return (
      <div className={`app ${darkMode ? "dark" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>

      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">TaskFlow</h1>
          <span className="app-subtitle">Stay organized, stay focused.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <div className="user-info">
              <div className="user-avatar-initials">
                {user.displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <span className="user-name">{user.displayName}</span>
              <button className="btn-logout" onClick={() => setShowLogoutModal(true)}>Logout</button>
            </div>
          ) : (
            <button className="btn-google" onClick={login}>
              <img src="/img/google.png" alt="Google" width={18} height={18} />
              Sign in with Google
            </button>
          )}
          <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* GUEST BANNER */}
      {!user && showBanner && (
        <div className={`guest-banner ${darkMode ? "dark" : ""}`}>
          <i className="bi bi-exclamation-triangle-fill"></i> Kamu sedang dalam mode tamu — data tidak tersimpan.{" "}
          <span onClick={login} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>Login dengan Google</span>{" "}
          untuk menyimpan data.
          <button className="banner-close" onClick={() => setShowBanner(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* WORKSPACE PANEL */}
      {user && (
        <WorkspacePanel
          user={user}
          workspace={workspace}
          myWorkspaces={myWorkspaces}
          onCreate={createWorkspace}
          onJoin={joinWorkspace}
          onLeave={leaveWorkspace}
          onSwitch={switchWorkspace}
          loading={wsLoading}
          error={wsError}
          darkMode={darkMode}
          activities={activities}
          onlineMembers={onlineMembers}
          onDelete={deleteWorkspace}
          onBulkDelete={bulkDeleteWorkspace}
        />
      )}

      {/* MAIN BOARD */}
      <main className="app-main">
      <Board
        tasks={tasks}
        columns={columns}
        onAdd={addTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onMove={moveTask}
        onReorder={reorderTasks}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
        onReorderColumns={reorderColumns}
        onRenameColumn={renameColumn}
        onArchive={archiveTask}
        onUnarchive={unarchiveTask}
        members={workspace ? workspaceMembers : {}}
        darkMode={darkMode}
        workspaceId={workspace?.id}
        user={user}
      />
      </main>

      {/* NOTIFICATION TOAST */}
      <NotificationToast notifications={notifications} onDismiss={dismiss} />

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className={`modal ${darkMode ? "dark" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <i className="bi bi-box-arrow-right"></i>
            </div>
            <h3 className="modal-title">Logout</h3>
            <p className="modal-desc">Yakin ingin keluar? Data kamu tetap tersimpan dan bisa diakses lagi saat login.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="btn-logout-confirm" onClick={handleLogout}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}

      <ShortcutHint darkMode={darkMode} />
    </div>
  );
}