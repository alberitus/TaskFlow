import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";

export function useActivity(user, workspaceId) {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (!workspaceId) return;
        const ref = collection(db, "workspaces", workspaceId, "activity");
        const q = query(ref, orderBy("createdAt", "desc"), limit(50));
        const unsub = onSnapshot(q, (snap) => {
            setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [workspaceId]);

    const logActivity = async (action, detail = "") => {
        if (!user || !workspaceId) return;
        await addDoc(collection(db, "workspaces", workspaceId, "activity"), {
            uid: user.uid,
            name: user.displayName,
            action,
            detail,
            createdAt: Date.now(),
        });
    };

    return { activities, logActivity };
}