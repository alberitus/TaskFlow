import { useState, useEffect } from "react";
import Board from "./components/Board";
import WorkspacePanel from "./components/WorkspacePanel";
import NotificationToast from "./components/NotificationToast";
import { useTasks } from "./hooks/useTasks";
import { useAuth } from "./hooks/useAuth";
import { useWorkspace } from "./hooks/useWorkspace";
import { usePresence } from "./hooks/usePresence";
import { useActivity } from "./hooks/useActivity";
import { useNotifications } from "./hooks/useNotifications";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState({});

  const { user, loading, login, logout } = useAuth();
  const { workspace, myWorkspaces, loading: wsLoading, error: wsError, createWorkspace, joinWorkspace, leaveWorkspace, switchWorkspace } = useWorkspace(user);
  const { onlineMembers } = usePresence(user, workspace?.id);
  const { activities, logActivity } = useActivity(user, workspace?.id);
  const { notifications, dismiss } = useNotifications(activities, user?.uid);

  const {
    tasks, columns, ready,
    addTask, updateTask, deleteTask, moveTask,
    reorderTasks, addColumn, deleteColumn, reorderColumns,
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
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.7-2.9-11.2-7.2l-6.5 5C9.8 39.7 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C41 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
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

    </div>
  );
}