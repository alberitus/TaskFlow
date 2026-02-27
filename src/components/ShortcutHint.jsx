export default function ShortcutHint({ darkMode }) {
    return (
        <div className={`shortcut-hint ${darkMode ? "dark" : ""}`}>
            <span><kbd>N</kbd> Task baru</span>
            <span><kbd>/</kbd> Cari</span>
            <span><kbd>A</kbd> Arsip</span>
            <span><kbd>D</kbd> Dark mode</span>
        </div>
    );
}