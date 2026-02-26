export default function NotificationToast({ notifications, onDismiss }) {
    if (notifications.length === 0) return null;

    return (
        <div className="toast-container">
            {notifications.map((n) => (
            <div key={n.id} className="toast-item">
                <i className="bi bi-bell-fill toast-icon"></i>
                <span className="toast-message">{n.message}</span>
                <button className="toast-close" onClick={() => onDismiss(n.id)}>
                    <i className="bi bi-x"></i>
                </button>
            </div>
            ))}
        </div>
    );
}