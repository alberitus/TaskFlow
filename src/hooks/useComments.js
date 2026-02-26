import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export function useComments(workspaceId, taskId) {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (!workspaceId || !taskId) return;
        const ref = collection(db, "workspaces", workspaceId, "tasks", taskId, "comments");
        const q = query(ref, orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [workspaceId, taskId]);

    const addComment = async (user, text) => {
        if (!user || !workspaceId || !taskId || !text.trim()) return;
        await addDoc(
        collection(db, "workspaces", workspaceId, "tasks", taskId, "comments"),
        {
            uid: user.uid,
            name: user.displayName,
            text,
            createdAt: Date.now(),
        }
        );
    };

    const deleteComment = async (commentId) => {
        await deleteDoc(doc(db, "workspaces", workspaceId, "tasks", taskId, "comments", commentId));
    };

    return { comments, addComment, deleteComment };
}