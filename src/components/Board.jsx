import {
    DndContext, closestCorners, PointerSensor,
    useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useMemo, useEffect } from "react";
import Column from "./Column";
import TaskCard from "./TaskCard";
import SortableColumn from "./SortableColumn";
import TaskDetailModal from "./TaskDetailModal";
import BoardToolbar from "./BoardToolbar";
import ArchivePanel from "./ArchivePanel";
import StatsPanel from "./StatsPanel";
import DeadlineTracker from "./DeadlineTracker";
import { useExport } from "../hooks/useExport";

const PRESET_COLORS = [
    "#ef4444", "#f59e0b", "#22c55e", "#6366f1",
    "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function Board({
tasks, columns, onAdd, onDelete, onUpdate, onMove, onReorder,
onAddColumn, onDeleteColumn, onReorderColumns, onRenameColumn,
onArchive, onUnarchive, darkMode, members, workspaceId, user,
}) {
    const [activeTask, setActiveTask] = useState(null);
    const [activeColumn, setActiveColumn] = useState(null);
    const [addingCol, setAddingCol] = useState(false);
    const [newColTitle, setNewColTitle] = useState("");
    const [newColColor, setNewColColor] = useState("#6366f1");
    const [selectedTask, setSelectedTask] = useState(null);

    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    const [showStats, setShowStats] = useState(false);
    const [showDeadline, setShowDeadline] = useState(false);
    const { exportCSV, exportPDF } = useExport(tasks, columns);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const processedTasks = useMemo(() => {
        let result = tasks.filter((t) => !t.archived);
    
        if (search) {
            result = result.filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));
        }
        if (filterPriority) {
            result = result.filter((t) => t.priority === filterPriority);
        }
        if (filterAssignee) {
            result = result.filter((t) => (t.assignees || []).some((a) => a.uid === filterAssignee));
        }
        if (sortBy === "priority-asc") {
            result = [...result].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        } else if (sortBy === "priority-desc") {
            result = [...result].sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
        } else if (sortBy === "date-asc") {
            result = [...result].sort((a, b) => new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999"));
        } else if (sortBy === "date-desc") {
            result = [...result].sort((a, b) => new Date(b.dueDate || "0") - new Date(a.dueDate || "0"));
        } else if (sortBy === "created-desc") {
            result = [...result].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else if (sortBy === "created-asc") {
            result = [...result].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        }
    
        return result;
    }, [tasks, search, filterPriority, filterAssignee, sortBy]);

    const handleDragStart = ({ active }) => {
        const task = tasks.find((t) => t.id === active.id);
        const col = columns.find((c) => c.id === active.id);
        if (task) setActiveTask(task);
        if (col) setActiveColumn(col);
    };

    const handleDragOver = ({ active, over }) => {
        if (!over) return;
        const activeTask = tasks.find((t) => t.id === active.id);
        if (!activeTask) return;
        const overColumn = columns.find((c) => c.id === over.id);
        if (overColumn && activeTask.columnId !== overColumn.id) {
            onMove(active.id, overColumn.id);
        }
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveTask(null);
        setActiveColumn(null);
        if (!over || active.id === over.id) return;
    
        const isCol = columns.find((c) => c.id === active.id);
        if (isCol) { onReorderColumns(active.id, over.id); return; }
    
        const overTask = tasks.find((t) => t.id === over.id);
        const activeTaskData = tasks.find((t) => t.id === active.id);
        if (!activeTaskData) return;
    
        if (overTask && activeTaskData.columnId === overTask.columnId) {
            onReorder(active.id, over.id);
        } else if (overTask && activeTaskData.columnId !== overTask.columnId) {
            onMove(active.id, overTask.columnId);
        }
    };

    const handleAddColumn = (e) => {
        e.preventDefault();
        if (!newColTitle.trim()) return;
        onAddColumn(newColTitle.trim(), newColColor);
        setNewColTitle("");
        setNewColColor("#6366f1");
        setAddingCol(false);
    };

    const defaults = ["todo", "inprogress", "done"];
    const currentSelectedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) || selectedTask : null;

    useEffect(() => {
        const handler = () => setShowArchived((v) => !v);
        window.addEventListener("toggle-archive", handler);
        return () => window.removeEventListener("toggle-archive", handler);
    }, []);

    return (
        <>
            {/* Toolbar */}
            <BoardToolbar
            search={search} onSearch={setSearch}
            filterPriority={filterPriority} onFilterPriority={setFilterPriority}
            filterAssignee={filterAssignee} onFilterAssignee={setFilterAssignee}
            sortBy={sortBy} onSort={setSortBy}
            showArchived={showArchived} onToggleArchived={setShowArchived}
            members={members}
            darkMode={darkMode}
            />

            {/* Secondary toolbar */}
            <div className={`board-toolbar-secondary ${darkMode ? "dark" : ""}`}>
                <button
                    className={`toolbar-btn ${showStats ? "active" : ""} ${darkMode ? "dark" : ""}`}
                    onClick={() => setShowStats(!showStats)}
                >
                    <i className="bi bi-bar-chart-line"></i> Statistik
                </button>
                <button
                    className={`toolbar-btn ${showDeadline ? "active" : ""} ${darkMode ? "dark" : ""}`}
                    onClick={() => setShowDeadline(!showDeadline)}
                >
                    <i className="bi bi-clock"></i> Deadline
                </button>
                <button className={`toolbar-btn ${darkMode ? "dark" : ""}`} onClick={exportCSV}>
                    <i className="bi bi-filetype-csv"></i> Export CSV
                </button>
                <button className={`toolbar-btn ${darkMode ? "dark" : ""}`} onClick={exportPDF}>
                    <i className="bi bi-file-pdf"></i> Export PDF
                </button>
            </div>

            {/* Stats panel */}
            {showStats && (
                <StatsPanel
                    tasks={tasks}
                    columns={columns}
                    darkMode={darkMode}
                    onClose={() => setShowStats(false)}
                />
            )}

            {/* Deadline tracker */}
            {showDeadline && (
                <DeadlineTracker tasks={tasks} darkMode={darkMode} />
            )}
    
            {/* Archive Panel */}
            {showArchived && (
                <ArchivePanel
                    tasks={tasks}
                    columns={columns}
                    onUnarchive={onUnarchive}
                    onDelete={onDelete}
                    darkMode={darkMode}
                />
            )}
    
            <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            >
                <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                    <div className="board">
                    {columns.map((col) => (
                        <SortableColumn key={col.id} id={col.id}>
                        <Column
                            column={col}
                            tasks={processedTasks.filter((t) => t.columnId === col.id)}
                            onAdd={onAdd}
                            onDelete={onDelete}
                            onOpen={setSelectedTask}
                            onDeleteColumn={onDeleteColumn}
                            onRenameColumn={onRenameColumn}
                            isDefault={defaults.includes(col.id)}
                            darkMode={darkMode}
                        />
                        </SortableColumn>
                    ))}
        
                    <div className={`add-column-wrap ${darkMode ? "dark" : ""}`}>
                        {!addingCol ? (
                        <button className="add-column-btn" onClick={() => setAddingCol(true)}>+ Add Board</button>
                        ) : (
                        <form className="add-column-form" onSubmit={handleAddColumn}>
                            <input autoFocus className="add-input" placeholder="Board name..." value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} />
                            <div className="color-presets">
                            {PRESET_COLORS.map((c) => (
                                <button key={c} type="button" className={`color-dot ${newColColor === c ? "active" : ""}`} style={{ background: c }} onClick={() => setNewColColor(c)} />
                            ))}
                            <label className="color-picker-label" title="Custom color">
                                <input type="color" value={newColColor} onChange={(e) => setNewColColor(e.target.value)} className="color-picker-input" />
                                <span className="color-picker-icon" style={{ borderColor: newColColor, color: newColColor }}>✏️</span>
                            </label>
                            </div>
                            <div className="color-preview" style={{ borderColor: newColColor, color: newColColor }}>
                            <span style={{ background: `${newColColor}22`, color: newColColor, padding: "2px 10px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600 }}>
                                {newColTitle || "Preview"}
                            </span>
                            </div>
                            <div className="add-actions">
                            <button type="submit" className="btn-confirm" style={{ background: newColColor }}>Add</button>
                            <button type="button" className="btn-cancel" onClick={() => setAddingCol(false)}>Cancel</button>
                            </div>
                        </form>
                        )}
                    </div>
                    </div>
                </SortableContext>
        
                <DragOverlay>
                    {activeTask && <TaskCard task={activeTask} onDelete={() => {}} onOpen={() => {}} darkMode={darkMode} />}
                    {activeColumn && (
                    <div className={`column ${darkMode ? "dark" : ""}`} style={{ opacity: 0.85, width: 280, borderTop: `3px solid ${activeColumn.color}` }}>
                        <div className="column-header">
                        <h2 className="column-title" style={{ color: activeColumn.color }}>{activeColumn.title}</h2>
                        </div>
                    </div>
                    )}
                </DragOverlay>
            </DndContext>
    
            {currentSelectedTask && (
                <TaskDetailModal
                    task={currentSelectedTask}
                    columns={columns}
                    members={members}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onClose={() => setSelectedTask(null)}
                    darkMode={darkMode}
                    workspaceId={workspaceId}
                    user={user}
                    onArchive={onArchive}
                />
            )}
        </>
    );
}