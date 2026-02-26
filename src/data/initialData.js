export const initialColumns = [
    { id: "todo", title: "To Do", order: 0, color: "#ef4444" },
    { id: "inprogress", title: "In Progress", order: 1, color: "#f59e0b" },
    { id: "done", title: "Done", order: 2, color: "#22c55e" },
];

export const initialTasks = [
    { id: "task-1", columnId: "todo", text: "Buat desain UI", priority: "high" },
    { id: "task-2", columnId: "todo", text: "Setup project React", priority: "medium" },
    { id: "task-3", columnId: "inprogress", text: "Install dependencies", priority: "low" },
    { id: "task-4", columnId: "done", text: "Inisialisasi repo Git", priority: "medium" },
];