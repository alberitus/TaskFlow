import { useEffect } from "react";

export function useKeyboardShortcuts({ onNewTask, onToggleDark, onSearch, onToggleArchive }) {
    useEffect(() => {
        const handler = (e) => {
            const tag = document.activeElement?.tagName;
            if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

            switch (e.key) {
                case "n":
                case "N":
                    e.preventDefault();
                    onNewTask?.();
                break;
                case "d":
                case "D":
                    e.preventDefault();
                    onToggleDark?.();
                break;
                case "/":
                    e.preventDefault();
                    onSearch?.();
                break;
                case "a":
                case "A":
                    e.preventDefault();
                    onToggleArchive?.();
                break;
                case "Escape":
                    // Handled by individual modals
                break;
                default:
                break;
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onNewTask, onToggleDark, onSearch, onToggleArchive]);
}