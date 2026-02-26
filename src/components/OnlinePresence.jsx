export default function OnlinePresence({ onlineMembers, darkMode }) {
    const members = Object.values(onlineMembers);
    if (members.length === 0) return null;

    return (
        <div className={`online-presence ${darkMode ? "dark" : ""}`}>
            <span className="online-label">
            <span className="online-dot-pulse" /> Online</span>
            <div className="online-avatars">
                {members.slice(0, 5).map((m) => (
                    <div key={m.uid} className="online-avatar" title={m.name}>
                        {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        <span className="online-dot" />
                    </div>
                ))}
                {members.length > 5 && (
                    <div className="online-avatar more">+{members.length - 5}</div>
                )}
            </div>
        </div>
    );
}