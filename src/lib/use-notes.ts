import { useStorage } from "@vueuse/core";
import { ref } from "vue";
import type { NoteMeta, Settings } from "../type";

const LEGACY_NOTE_KEY = "text-editor-content";
const MAX_NOTES = 50;

export const useNotes = (settings: ReturnType<typeof useStorage<Settings>>) => {
    const notes = useStorage<NoteMeta[]>("text-editor-notes", []);
    const activeNoteId = ref("");
    const activeNoteInStorage = useStorage(
        "text-editor-active-note",
        "",
        sessionStorage,
    );
    const noteCounter = useStorage("text-editor-note-counter", 0);
    const isLoadingNote = ref(false);
    const value = ref("");

    const getNoteContent = (noteId: string) =>
        localStorage.getItem(noteId) ?? "";
    const setNoteContent = (noteId: string, content: string) =>
        localStorage.setItem(noteId, content);
    const isContentEmpty = (content: string) => content.trim().length === 0;

    const normalizeTitle = (content: string) => {
        const clean = content.replace(/\s+/g, " ").trim();
        return (clean || "Untitled note").slice(0, 50);
    };

    const sortAndTrimNotes = (list: NoteMeta[]) =>
        list.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_NOTES);

    const syncCounterWithExistingNotes = () => {
        const maxIdFromNotes = notes.value.reduce((max, note) => {
            const match = note.id.match(/^note_(\d+)$/);
            if (!match) {
                return max;
            }
            return Math.max(max, Number(match[1]));
        }, 0);
        if (noteCounter.value < maxIdFromNotes) {
            noteCounter.value = maxIdFromNotes;
        }
    };

    const upsertNoteMeta = (noteId: string, content: string, touch = true) => {
        if (isContentEmpty(content)) {
            return;
        }
        const existing = notes.value.find((note) => note.id === noteId);
        const updatedAt = touch
            ? Date.now()
            : (existing?.updatedAt ?? Date.now());
        const next = notes.value.filter((note) => note.id !== noteId);
        next.push({
            id: noteId,
            title: normalizeTitle(content),
            updatedAt,
        });
        notes.value = sortAndTrimNotes(next);
    };

    const createNote = (content = "") => {
        syncCounterWithExistingNotes();
        noteCounter.value += 1;
        const noteId = `note_${noteCounter.value}`;
        if (!isContentEmpty(content)) {
            setNoteContent(noteId, content);
            upsertNoteMeta(noteId, content, true);
        }
        return noteId;
    };

    const clearActiveNote = () => {
        activeNoteId.value = "";
        activeNoteInStorage.value = "";
        isLoadingNote.value = true;
        value.value = "";
        isLoadingNote.value = false;
    };

    const deleteNote = (noteId: string) => {
        localStorage.removeItem(noteId);
        notes.value = notes.value.filter((note) => note.id !== noteId);
        if (activeNoteId.value === noteId) {
            clearActiveNote();
        }
    };

    const cleanupEmptySavedNotes = () => {
        const next: NoteMeta[] = [];
        notes.value.forEach((note) => {
            const content = getNoteContent(note.id);
            if (isContentEmpty(content)) {
                localStorage.removeItem(note.id);
                return;
            }
            next.push({
                id: note.id,
                title: normalizeTitle(content),
                updatedAt: note.updatedAt,
            });
        });
        notes.value = sortAndTrimNotes(next);
    };

    const saveOrDeleteCurrentNote = (content: string) => {
        if (isContentEmpty(content)) {
            if (activeNoteId.value) {
                deleteNote(activeNoteId.value);
            }
            return;
        }

        if (!activeNoteId.value) {
            const newNoteId = createNote(content);
            activeNoteId.value = newNoteId;
            activeNoteInStorage.value = newNoteId;
            return;
        }

        setNoteContent(activeNoteId.value, content);
        upsertNoteMeta(activeNoteId.value, content, true);
    };

    const openNote = (noteId: string, persistAsLast = true) => {
        const content = getNoteContent(noteId);
        activeNoteId.value = noteId;
        if (persistAsLast) {
            activeNoteInStorage.value = noteId;
        }
        if (!notes.value.some((note) => note.id === noteId)) {
            upsertNoteMeta(noteId, content, false);
        }
        isLoadingNote.value = true;
        value.value = content;
        isLoadingNote.value = false;
    };

    const initializeNotes = () => {
        cleanupEmptySavedNotes();
        syncCounterWithExistingNotes();

        const legacy = localStorage.getItem(LEGACY_NOTE_KEY);
        if (legacy !== null) {
            if (!isContentEmpty(legacy)) {
                createNote(legacy);
            }
            localStorage.removeItem(LEGACY_NOTE_KEY);
        }

        const fallbackNoteId = notes.value[0]?.id ?? "";

        if (settings.value.newNoteBehavior === "start-fresh") {
            clearActiveNote();
            return;
        }

        const hasActiveNote = notes.value.some(
            (note) => note.id === activeNoteInStorage.value,
        );
        const noteToOpen = hasActiveNote
            ? activeNoteInStorage.value
            : fallbackNoteId;
        if (!noteToOpen) {
            clearActiveNote();
            return;
        }
        openNote(noteToOpen);
    };

    return {
        notes,
        activeNoteId,
        activeNoteInStorage,
        isLoadingNote,
        value,
        openNote,
        deleteNote,
        clearActiveNote,
        initializeNotes,
        saveOrDeleteCurrentNote,
        createNote,
    };
};
