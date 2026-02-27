import { useState, useEffect } from "react";
import {
    doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs, deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function useWorkspace(user) {
    const [workspace, setWorkspace] = useState(null);
    const [myWorkspaces, setMyWorkspaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) { setMyWorkspaces([]); return; }

        const wsRef = collection(db, "workspaces");
        const q = query(wsRef, where(`members.${user.uid}`, "==", true));
        const unsub = onSnapshot(q, (snap) => {
            setMyWorkspaces(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [user]);

    const createWorkspace = async (name) => {
        if (!user) return;
        setLoading(true); setError("");
        try {
            const code = generateCode();
            const wsRef = doc(db, "workspaces", code);
            await setDoc(wsRef, {
                id: code, name,
                ownerId: user.uid,
                ownerName: user.displayName,
                members: { [user.uid]: true },
                memberNames: { [user.uid]: user.displayName },
                createdAt: Date.now(),
            });
            setWorkspace({ id: code, name, ownerId: user.uid });
        } catch (e) { setError("Gagal membuat workspace."); }
        setLoading(false);
    };

    const joinWorkspace = async (code) => {
        if (!user) return;
        setLoading(true); setError("");
        try {
            const wsRef = doc(db, "workspaces", code.toUpperCase());
            const snap = await getDoc(wsRef);
            if (!snap.exists()) { setError("Kode workspace tidak ditemukan."); setLoading(false); return; }
            await updateDoc(wsRef, {
                [`members.${user.uid}`]: true,
                [`memberNames.${user.uid}`]: user.displayName,
            });
            const data = snap.data();
            setWorkspace({ id: code.toUpperCase(), name: data.name, ownerId: data.ownerId });
        } catch (e) { setError("Gagal bergabung ke workspace."); }
        setLoading(false);
    };

    const deleteWorkspace = async (wsId) => {
        if (!user) return;
        const wsRef = doc(db, "workspaces", wsId);
        const snap = await getDoc(wsRef);
        if (!snap.exists()) return;
        if (snap.data().ownerId !== user.uid) return;
        await deleteDoc(wsRef);
        if (workspace?.id === wsId) setWorkspace(null);
    };

    const bulkDeleteWorkspace = async (wsIds) => {
        await Promise.all(wsIds.map((id) => deleteWorkspace(id)));
    };

    const switchWorkspace = (ws) => setWorkspace(ws);
    const leaveWorkspace = () => setWorkspace(null);

    return { workspace, myWorkspaces, loading, error, createWorkspace, joinWorkspace, leaveWorkspace, switchWorkspace, deleteWorkspace, bulkDeleteWorkspace };
}