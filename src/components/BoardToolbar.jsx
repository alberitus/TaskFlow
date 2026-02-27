import { useState } from "react";

const SORT_OPTIONS = [
    { value: "", label: "Default" },
    { value: "priority-asc", label: "Priority (High → Low)" },
    { value: "priority-desc", label: "Priority (Low → High)" },
    { value: "date-asc", label: "Due Date (Terlama)" },
    { value: "date-desc", label: "Due Date (Terbaru)" },
    { value: "created-desc", label: "Terbaru dibuat" },
    { value: "created-asc", label: "Terlama dibuat" },
];

export default function BoardToolbar({
    search, onSearch,
    filterPriority, onFilterPriority,
    filterAssignee, onFilterAssignee,
    sortBy, onSort,
    showArchived, onToggleArchived,
    members, darkMode,
}) {
    const [showFilters, setShowFilters] = useState(false);

    const activeFilterCount = [
        filterPriority, filterAssignee, sortBy, showArchived
    ].filter(Boolean).length;

    return (
        <div className={`board-toolbar ${darkMode ? "dark" : ""}`}>
            {/* Search */}
            <div className="toolbar-search">
                <i className="bi bi-search toolbar-search-icon"></i>
                <input className={`toolbar-search-input ${darkMode ? "dark" : ""}`}
                placeholder="Cari task..."
                value={search}
                onChange={(e) => onSearch(e.target.value)} />
                {search && (
                    <button className="toolbar-clear" onClick={() => onSearch("")}>
                        <i className="bi bi-x"></i>
                    </button>
                )}
            </div>

            {/* Filter & Sort toggle */}
            <button className={`toolbar-btn ${showFilters ? "active" : ""} ${darkMode ? "dark" : ""}`}
                onClick={() => setShowFilters(!showFilters)}>
                <i className="bi bi-funnel"></i> Filter & Sort
                {activeFilterCount > 0 && <span className="toolbar-badge">{activeFilterCount}</span>}
            </button>

            {/* Archive toggle */}
            <button className={`toolbar-btn ${showArchived ? "active" : ""} ${darkMode ? "dark" : ""}`}
                onClick={() => onToggleArchived(!showArchived)}
                title="Lihat task yang diarsipkan">
                    <i className={`bi bi-archive${showArchived ? "-fill" : ""}`}></i>
                    {showArchived ? " Sembunyikan Arsip" : " Arsip"}
            </button>

            {/* Reset filters */}
            {activeFilterCount > 0 && (
                <button className={`toolbar-btn reset ${darkMode ? "dark" : ""}`} onClick={() => {
                onSearch(""); onFilterPriority(""); onFilterAssignee(""); onSort(""); onToggleArchived(false);}}>
                    <i className="bi bi-x-circle"></i> Reset
                </button>
            )}

            {/* Filter panel */}
            {showFilters && (
                <div className={`filter-panel ${darkMode ? "dark" : ""}`}>

                    {/* Priority filter */}
                    <div className="filter-group">
                        <label className="filter-label"><i className="bi bi-flag"></i> Priority</label>
                        <div className="filter-options">
                        {["", "high", "medium", "low"].map((p) => (
                            <button key={p} className={`filter-chip ${filterPriority === p ? "active" : ""} ${darkMode ? "dark" : ""}`}
                            onClick={() => onFilterPriority(p)}>
                                {p === "" ? "Semua" : p === "high" ? "🔴 High" : p === "medium" ? "🟡 Medium" : "🟢 Low"}
                            </button>
                        ))}
                        </div>
                    </div>

                    {/* Assignee filter */}
                    {members && Object.keys(members).length > 0 && (
                        <div className="filter-group">
                            <label className="filter-label"><i className="bi bi-person"></i> Assignee</label>
                            <div className="filter-options">
                                <button className={`filter-chip ${filterAssignee === "" ? "active" : ""} ${darkMode ? "dark" : ""}`}
                                onClick={() => onFilterAssignee("")}>Semua</button>
                                {Object.entries(members).map(([uid, name]) => (
                                <button key={uid} className={`filter-chip ${filterAssignee === uid ? "active" : ""} ${darkMode ? "dark" : ""}`}
                                onClick={() => onFilterAssignee(uid)}>
                                    {name.split(" ")[0]}
                                </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sort */}
                    <div className="filter-group">
                        <label className="filter-label"><i className="bi bi-sort-down"></i> Urutkan</label>
                        <div className="filter-options">
                        {SORT_OPTIONS.map((s) => (
                            <button key={s.value} className={`filter-chip ${sortBy === s.value ? "active" : ""} ${darkMode ? "dark" : ""}`}
                            onClick={() => onSort(s.value)}>
                                {s.label}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}