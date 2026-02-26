import { useEffect } from "react";
import { doc, setDoc, deleteDoc, onSnapshot, collection } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase";

export function usePresence(user, workspaceId) {
    const [onlineMembers, setOnlineMembers] = useState({});

    useEffect(() => {
        if (!user || !workspaceId) return;

        const presenceRef = doc(db, "workspaces", workspaceId, "presence", user.uid);

        setDoc(presenceRef, {
            uid: user.uid,
            name: user.displayName,
            onlineAt: Date.now(),
        });

        const handleUnload = () => deleteDoc(presenceRef);
        window.addEventListener("beforeunload", handleUnload);

        const colRef = collection(db, "workspaces", workspaceId, "presence");
        const unsub = onSnapshot(colRef, (snap) => {
            const data = {};
            snap.docs.forEach((d) => { data[d.id] = d.data(); });
            setOnlineMembers(data);
        });

        return () => {
            deleteDoc(presenceRef);
            window.removeEventListener("beforeunload", handleUnload);
            unsub();
        };
    }, [user, workspaceId]);

    return { onlineMembers };
}