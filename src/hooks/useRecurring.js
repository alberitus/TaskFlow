import { useEffect } from "react";

const INTERVALS = {
    daily: 86400000,
    weekly: 86400000 * 7,
    monthly: 86400000 * 30,
};

export function useRecurring(tasks, addTask) {
    useEffect(() => {
        if (!tasks.length) return;

        const now = Date.now();
        const doneTasks = tasks.filter(
            (t) => t.columnId === "done" && t.recurring && t.recurring !== "none"
        );

        doneTasks.forEach((t) => {
            const interval = INTERVALS[t.recurring];
            if (!interval) return;
            const lastDone = t.doneAt || t.createdAt || now;
            if (now - lastDone >= interval) {
                addTask(t.columnId === "done" ? "todo" : t.columnId, t.text, t.priority, {
                description: t.description,
                recurring: t.recurring,
                dueDate: t.dueDate
                    ? new Date(new Date(t.dueDate).getTime() + interval).toISOString().slice(0, 10)
                    : "",
                });
            }
        });
    }, [tasks]);
}