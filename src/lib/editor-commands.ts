/**
 * Text editing commands for a <textarea>.
 *
 * Every edit goes through `insertText`, which uses `execCommand("insertText")` when available.
 * That keeps the browser's native undo/redo stack intact and fires an `input` event, so
 * `v-model` (and therefore note saving) stays in sync. A `setRangeText` fallback is used otherwise.
 */

const insertText = (el: HTMLTextAreaElement, text: string) => {
    el.focus();
    let ok = false;
    try {
        ok = document.execCommand("insertText", false, text);
    } catch {
        ok = false;
    }
    if (!ok) {
        el.setRangeText(text, el.selectionStart, el.selectionEnd, "end");
        el.dispatchEvent(new Event("input", { bubbles: true }));
    }
};

const wrapSelection = (el: HTMLTextAreaElement, before: string, after = before, placeholder = "") => {
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e);

    // Toggle off when the selection is already wrapped.
    if (selected && value.slice(s - before.length, s) === before && value.slice(e, e + after.length) === after) {
        el.setSelectionRange(s - before.length, e + after.length);
        insertText(el, selected);
        el.setSelectionRange(s - before.length, e - before.length);
        return;
    }

    const inner = selected || placeholder;
    insertText(el, before + inner + after);
    el.setSelectionRange(s + before.length, s + before.length + inner.length);
};

const transformSelection = (el: HTMLTextAreaElement, fn: (text: string) => string) => {
    const { selectionStart: s, selectionEnd: e, value } = el;
    if (s === e) return;
    insertText(el, fn(value.slice(s, e)));
    el.setSelectionRange(s, e);
};

const indent = (el: HTMLTextAreaElement, outdent: boolean) => {
    const { selectionStart: s, value } = el;
    let e = el.selectionEnd;
    const collapsed = s === e;

    if (!outdent && collapsed) {
        insertText(el, "\t");
        return;
    }
    // Ignore a trailing newline in the selection (e.g. after shift+down).
    if (e > s && value[e - 1] === "\n") e -= 1;

    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const nextBreak = value.indexOf("\n", e);
    const lineEnd = nextBreak === -1 ? value.length : nextBreak;
    const lines = value.slice(lineStart, lineEnd).split("\n");

    let removedFirst = 0;
    const updated = lines.map((line, i) => {
        if (!outdent) return `\t${line}`;
        const match = line.match(/^(\t| {1,4})/);
        const removed = match ? match[0].length : 0;
        if (i === 0) removedFirst = removed;
        return line.slice(removed);
    });
    const block = updated.join("\n");
    if (block === lines.join("\n")) return;

    el.setSelectionRange(lineStart, lineEnd);
    insertText(el, block);

    if (collapsed && lines.length === 1) {
        const caret = outdent ? Math.max(lineStart, s - removedFirst) : s + 1;
        el.setSelectionRange(caret, caret);
    } else {
        el.setSelectionRange(lineStart, lineStart + block.length);
    }
};

/** Continue markdown-style lists and indentation on Enter. Returns true when handled. */
const continueList = (el: HTMLTextAreaElement): boolean => {
    const { selectionStart: s, selectionEnd: e, value } = el;
    if (s !== e) return false;

    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const line = value.slice(lineStart, s);
    const match = line.match(/^(\s*)([-*+] \[[ xX]\] |[-*+] |(\d+)([.)]) )?/);
    if (!match || !match[0]) return false;

    const [, whitespace, marker, num, delimiter] = match;

    // Empty list item: end the list instead of adding another bullet.
    if (marker && line.trim() === marker.trim()) {
        el.setSelectionRange(lineStart, s);
        insertText(el, whitespace);
        return true;
    }

    let nextMarker = "";
    if (marker) {
        if (num) nextMarker = `${Number(num) + 1}${delimiter} `;
        else nextMarker = marker.replace(/\[[xX]\]/, "[ ]");
    }
    insertText(el, `\n${whitespace}${nextMarker}`);
    return true;
};

export const handleEditorKeydown = (event: KeyboardEvent) => {
    const el = event.target as HTMLTextAreaElement;
    if (event.isComposing) return;
    const mod = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();

    if (event.key === "Tab" && !mod && !event.altKey) {
        event.preventDefault();
        indent(el, event.shiftKey);
        return;
    }

    if (event.key === "Enter" && !mod && !event.shiftKey && !event.altKey) {
        if (continueList(el)) event.preventDefault();
        return;
    }

    if (!mod || event.altKey) return;

    if (event.shiftKey) {
        if (key === "l") {
            event.preventDefault();
            transformSelection(el, (t) => t.toLowerCase());
        } else if (key === "u") {
            event.preventDefault();
            transformSelection(el, (t) => t.toUpperCase());
        }
        return;
    }

    switch (key) {
        case "b":
            event.preventDefault();
            wrapSelection(el, "**", "**", "bold");
            break;
        case "i":
            event.preventDefault();
            wrapSelection(el, "*", "*", "italic");
            break;
        case "u":
            event.preventDefault();
            wrapSelection(el, "__", "__", "underline");
            break;
        case "k": {
            event.preventDefault();
            const { selectionStart: s, selectionEnd: e, value } = el;
            const text = value.slice(s, e) || "Text";
            insertText(el, `[${text}](https://)`);
            const urlStart = s + text.length + 3;
            el.setSelectionRange(urlStart + "https://".length, urlStart + "https://".length);
            break;
        }
    }
};
