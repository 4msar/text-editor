export const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

export const modKey = isMac ? "⌘" : "Ctrl";
export const altKey = isMac ? "⌥" : "Alt";
export const shiftKey = isMac ? "⇧" : "Shift";

export type ShortcutInfo = { keys: string[]; label: string; group: "General" | "Notes" | "Formatting" };

export const shortcuts: ShortcutInfo[] = [
    { keys: [modKey, "O"], label: "Open file", group: "General" },
    { keys: [modKey, "S"], label: "Download note", group: "General" },
    { keys: [modKey, ","], label: "Settings", group: "General" },
    { keys: [modKey, "/"], label: "Help", group: "General" },
    { keys: ["Esc"], label: "Close dialog / panel", group: "General" },
    { keys: [altKey, "N"], label: "New note", group: "Notes" },
    { keys: [altKey, "L"], label: "Toggle notes list", group: "Notes" },
    { keys: [modKey, "B"], label: "Bold", group: "Formatting" },
    { keys: [modKey, "I"], label: "Italic", group: "Formatting" },
    { keys: [modKey, "U"], label: "Underline", group: "Formatting" },
    { keys: [modKey, "K"], label: "Link", group: "Formatting" },
    { keys: [modKey, shiftKey, "L"], label: "Lowercase selection", group: "Formatting" },
    { keys: [modKey, shiftKey, "U"], label: "Uppercase selection", group: "Formatting" },
    { keys: ["Tab"], label: "Indent", group: "Formatting" },
    { keys: [shiftKey, "Tab"], label: "Outdent", group: "Formatting" },
];

const fmt = (s: ShortcutInfo) => `${s.keys.join(" + ")}  ${s.label}`;

export const placeholderTexts = [
    "Start writing...\n",
    ...shortcuts.slice(0, 3).map(fmt),
    fmt(shortcuts[5]),
    "\nYou can also drag and drop files here.",
];
