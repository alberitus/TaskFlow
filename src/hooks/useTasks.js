import { useState, useEffect } from "react";
import {
    collection, doc, setDoc, deleteDoc,
    onSnapshot, writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { initialTasks, initialColumns } from "../data/initialData";

export function useTasks(user, workspaceId = null) {
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState([]);
    const [ready, setReady] = useState(false);

    const getColRef = () => workspaceId
        ? collection(db, "workspaces", workspaceId, "columns")
        : user ? collection(db, "users", user.uid, "columns") : null;

    const getTaskRef = () => workspaceId
        ? collection(db, "workspaces", workspaceId, "tasks")
        : user ? collection(db, "users", user.uid, "tasks") : null;

    useEffect(() => {
        if (!user && !workspaceId) {
            setColumns(initialColumns);
            setTasks(initialTasks);
            setReady(true);
            return;
        }

        const colRef = getColRef();
        const taskRef = getTaskRef();
        if (!colRef || !taskRef) return;

        const unsub1 = onSnapshot(colRef, (snap) => {
            if (snap.empty) {
                const batch = writeBatch(db);
                initialColumns.forEach((c) => batch.set(doc(colRef, c.id), c));
                batch.commit();
            } else {
                setColumns(snap.docs.map((d) => d.data()).sort((a, b) => a.order - b.order));
            }
        });

        const unsub2 = onSnapshot(taskRef, (snap) => {
            setTasks(snap.docs.map((d) => d.data()));
            setReady(true);
        });

        return () => { unsub1(); unsub2(); };
    }, [user, workspaceId]);

    const addTask = async (columnId, text, priority = "medium") => {
        const newTask = {
            id: `task-${Date.now()}`,
            columnId, text, priority,
            description: "", dueDate: "",
            subtasks: [], assignees: [],
            createdAt: Date.now()
        };
        const ref = getTaskRef();
        if (ref) await setDoc(doc(ref, newTask.id), newTask);
        else setTasks((prev) => [...prev, newTask]);
        logActivity?.("menambah task", text);
    };
    
    const updateTask = async (taskId, updates) => {
        const ref = getTaskRef();
        if (ref) await setDoc(doc(ref, taskId), updates, { merge: true });
        else setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
        if (updates.text) logActivity?.("mengubah task", updates.text);
    };
    
    const deleteTask = async (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        const ref = getTaskRef();
        if (ref) await deleteDoc(doc(ref, taskId));
        else setTasks((prev) => prev.filter((t) => t.id !== taskId));
        logActivity?.("menghapus task", task?.text || "");
    };
    
    const moveTask = async (taskId, newColumnId) => {
        const task = tasks.find((t) => t.id === taskId);
        const updates = {
            columnId: newColumnId,
            ...(newColumnId === "done" ? { doneAt: Date.now() } : {}),
        };
        const ref = getTaskRef();
        if (ref) await setDoc(doc(ref, taskId), updates, { merge: true });
        else setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
        logActivity?.("memindahkan task", task?.text || "");
    };
    
    const reorderTasks = (activeId, overId) => {
        setTasks((prev) => {
            const oldIndex = prev.findIndex((t) => t.id === activeId);
            const newIndex = prev.findIndex((t) => t.id === overId);
            const updated = [...prev];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);
            return updated;
        });
    };

    const addColumn = async (title, color = "#6366f1") => {
        const maxOrder = columns.length > 0 ? Math.max(...columns.map((c) => c.order)) : -1;
        const newCol = { id: `col-${Date.now()}`, title, color, order: maxOrder + 1 };
        const ref = getColRef();
        if (ref) await setDoc(doc(ref, newCol.id), newCol);
        else setColumns((prev) => [...prev, newCol]);
    };

    const deleteColumn = async (columnId) => {
        const defaults = ["todo", "inprogress", "done"];
        if (defaults.includes(columnId)) return;
        const colRef = getColRef();
        const taskRef = getTaskRef();
        if (colRef) {
            await deleteDoc(doc(colRef, columnId));
            const toDelete = tasks.filter((t) => t.columnId === columnId);
            await Promise.all(toDelete.map((t) => deleteDoc(doc(taskRef, t.id))));
        } else {
            setColumns((prev) => prev.filter((c) => c.id !== columnId));
            setTasks((prev) => prev.filter((t) => t.columnId !== columnId));
        }
    };

    const reorderColumns = async (activeId, overId) => {
        setColumns((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const oldIndex = sorted.findIndex((c) => c.id === activeId);
        const newIndex = sorted.findIndex((c) => c.id === overId);
        const reordered = [...sorted];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const todoIdx = reordered.findIndex((c) => c.id === "todo");
        const inprogressIdx = reordered.findIndex((c) => c.id === "inprogress");
        const doneIdx = reordered.findIndex((c) => c.id === "done");
        if (todoIdx > inprogressIdx || inprogressIdx > doneIdx) return prev;

        const updated = reordered.map((c, i) => ({ ...c, order: i }));
        const ref = getColRef();
        if (ref) {
            const batch = writeBatch(db);
            updated.forEach((c) => batch.set(doc(ref, c.id), c));
            batch.commit();
        }
        return updated;
        });
    };

    const renameColumn = async (columnId, newTitle) => {
        const ref = getColRef();
        if (ref) await setDoc(doc(ref, columnId), { title: newTitle }, { merge: true });
        else setColumns((prev) => prev.map((c) => c.id === columnId ? { ...c, title: newTitle } : c));
        logActivity?.("mengubah nama board", newTitle);
    };

    const archiveTask = async (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        const ref = getTaskRef();
        if (ref) await setDoc(doc(ref, taskId), { archived: true }, { merge: true });
        else setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, archived: true } : t));
        logActivity?.("mengarsipkan task", task?.text || "");
    };

    const unarchiveTask = async (taskId) => {
        const ref = getTaskRef();
        if (ref) await setDoc(doc(ref, taskId), { archived: false }, { merge: true });
        else setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, archived: false } : t));
    };

    return {
        tasks, ready,
        columns: [...columns].sort((a, b) => a.order - b.order),
        addTask, updateTask, deleteTask, moveTask,
        reorderTasks, addColumn, deleteColumn, reorderColumns,
        renameColumn, archiveTask, unarchiveTask,
    };
}