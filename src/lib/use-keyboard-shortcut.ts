import { onMounted, onUnmounted } from "vue";

type Keys = "ctrl" | "meta" | "cmd" | "shift" | "alt";
type ShortcutKeyFormat = `${Keys}+${string}`;

type ParsedShortcut = { ctrl: boolean; meta: boolean; shift: boolean; alt: boolean; key: string };

const parse = (shortcut: string): ParsedShortcut => {
    const parts = shortcut.split("+").map((k) => k.trim().toLowerCase());
    return {
        ctrl: parts.includes("ctrl"),
        meta: parts.includes("cmd") || parts.includes("meta"),
        shift: parts.includes("shift"),
        alt: parts.includes("alt"),
        key: parts[parts.length - 1],
    };
};

const keyMatches = (event: KeyboardEvent, key: string) => {
    if (event.key.toLowerCase() === key) return true;
    // Alt/Option changes event.key on macOS (alt+n => "˜"), so fall back to the physical key.
    if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`;
    if (/^[0-9]$/.test(key)) return event.code === `Digit${key}`;
    return false;
};

/**
 * Composable for handling keyboard shortcuts.
 * Modifiers must match exactly, so `cmd+l` does not also fire on `cmd+shift+l`.
 */
export const useKeyboardShortcut = (
    shortcut: ShortcutKeyFormat | ShortcutKeyFormat[],
    callback: (event: KeyboardEvent) => void,
) => {
    const parsed = (Array.isArray(shortcut) ? shortcut : [shortcut]).map(parse);

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.isComposing) return;
        const hit = parsed.some(
            (s) =>
                s.ctrl === event.ctrlKey &&
                s.meta === event.metaKey &&
                s.shift === event.shiftKey &&
                s.alt === event.altKey &&
                keyMatches(event, s.key),
        );
        if (hit) {
            event.preventDefault();
            callback(event);
        }
    };

    onMounted(() => window.addEventListener("keydown", handleKeydown));
    onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
};
