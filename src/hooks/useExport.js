export function useExport(tasks, columns) {

    const exportCSV = () => {
        const headers = ["Task", "Board", "Priority", "Due Date", "Assignees", "Subtasks Done", "Archived"];
        const rows = tasks.map((t) => {
            const col = columns.find((c) => c.id === t.columnId);
            const subtaskDone = (t.subtasks || []).filter((s) => s.done).length;
            const subtaskTotal = (t.subtasks || []).length;
            return [
                `"${t.text.replace(/"/g, '""')}"`,
                col?.title || "",
                t.priority,
                t.dueDate || "",
                (t.assignees || []).map((a) => a.name).join(", "),
                subtaskTotal > 0 ? `${subtaskDone}/${subtaskTotal}` : "",
                t.archived ? "Ya" : "Tidak",
            ];
        });
    
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const activeTasks = tasks.filter((t) => !t.archived);
    
        let html = `
            <html><head><style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            h1 { font-size: 1.5rem; margin-bottom: 4px; }
            .subtitle { color: #94a3b8; font-size: 0.85rem; margin-bottom: 24px; }
            .board-section { margin-bottom: 24px; }
            .board-title { font-size: 1rem; font-weight: 700; padding: 6px 0; border-bottom: 2px solid; margin-bottom: 12px; }
            .task-item { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
            .task-name { font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
            .task-meta { font-size: 0.75rem; color: #64748b; display: flex; gap: 12px; flex-wrap: wrap; }
            .badge { padding: 1px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
            .high { background: #fef2f2; color: #ef4444; }
            .medium { background: #fffbeb; color: #f59e0b; }
            .low { background: #f0fdf4; color: #22c55e; }
            @media print { body { padding: 0; } }
            </style></head><body>
            <h1>TaskFlow Export</h1>
            <div class="subtitle">Diekspor pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })} — ${activeTasks.length} task aktif</div>
        `;
    
        columns.forEach((col) => {
            const colTasks = activeTasks.filter((t) => t.columnId === col.id);
            if (colTasks.length === 0) return;
            html += `<div class="board-section">
            <div class="board-title" style="color:${col.color};border-color:${col.color}">${col.title} (${colTasks.length})</div>`;
            colTasks.forEach((t) => {
                const subtaskDone = (t.subtasks || []).filter((s) => s.done).length;
                const subtaskTotal = (t.subtasks || []).length;
                html += `<div class="task-item">
                    <div class="task-name">${t.text}</div>
                    <div class="task-meta">
                    <span class="badge ${t.priority}">${t.priority}</span>
                    ${t.dueDate ? `<span>📅 ${new Date(t.dueDate).toLocaleDateString("id-ID")}</span>` : ""}
                    ${subtaskTotal > 0 ? `<span>☑ ${subtaskDone}/${subtaskTotal} subtask</span>` : ""}
                    ${(t.assignees || []).length > 0 ? `<span>👤 ${t.assignees.map((a) => a.name).join(", ")}</span>` : ""}
                    </div>
                    ${t.description ? `<div style="font-size:0.8rem;color:#64748b;margin-top:6px">${t.description}</div>` : ""}
                </div>`;
            });
            html += `</div>`;
        });
    
        html += `</body></html>`;
        const win = window.open("", "_blank");
        win.document.write(html);
        win.document.close();
        win.print();
    };

    return { exportCSV, exportPDF };
}