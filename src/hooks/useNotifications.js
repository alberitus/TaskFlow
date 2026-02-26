import { useState, useEffect, useRef } from "react";

export function useNotifications(activities, currentUid) {
    const [notifications, setNotifications] = useState([]);
    const prevCountRef = useRef(activities.length);

    useEffect(() => {
        if (activities.length > prevCountRef.current) {
            const latest = activities[0];
            if (latest && latest.uid !== currentUid) {
                const notif = {
                    id: Date.now(),
                    message: `${latest.name} ${latest.action}${latest.detail ? `: ${latest.detail}` : ""}`,
                };
                setNotifications((prev) => [notif, ...prev].slice(0, 5));

                setTimeout(() => {
                    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                }, 4000);
            }
        }
        prevCountRef.current = activities.length;
    }, [activities]);

    const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

    return { notifications, dismiss };
}