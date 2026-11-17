import { useStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { toast } from "./use-toast";
import type { FileMeta, NoteMeta, Settings } from "../type";

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
    // File details for a note that hasn't been saved yet (e.g. an empty file was just opened).
    const pendingFile = ref<FileMeta | null>(null);

    const getNoteContent = (noteId: string) =>
        localStorage.getItem(noteId) ?? "";
    let quotaWarned = false;
    const setNoteContent = (noteId: string, content: string) => {
        try {
            localStorage.setItem(noteId, content);
            quotaWarned = false;
        } catch {
            if (!quotaWarned) {
                quotaWarned = true;
                toast.error("Storage is full — this note can't be saved. Download it or delete old notes.");
            }
        }
    };
    const isContentEmpty = (content: string) => content.trim().length === 0;

    const normalizeTitle = (content: string) => {
        const clean = content.replace(/\s+/g, " ").trim();
        return (clean || "Untitled note").slice(0, 50);
    };
    // Notes opened from a file keep the file name as their title.
    const titleFor = (content: string, file?: FileMeta) => file?.name ?? normalizeTitle(content);

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
        const file = existing?.file ?? (pendingFile.value || undefined);
        next.push({
            id: noteId,
            title: titleFor(content, file),
            updatedAt,
            ...(file ? { file } : {}),
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
            pendingFile.value = null;
        }
        return noteId;
    };

    const clearActiveNote = () => {
        activeNoteId.value = "";
        activeNoteInStorage.value = "";
        pendingFile.value = null;
        isLoadingNote.value = true;
        value.value = "";
        isLoadingNote.value = false;
    };

    const newNote = () => {
        if (activeNoteId.value) {
            const currentContent = value.value;
            if (isContentEmpty(currentContent)) {
                deleteNote(activeNoteId.value);
            } else {
                setNoteContent(activeNoteId.value, currentContent);
                upsertNoteMeta(activeNoteId.value, currentContent, true);
            }
        }
        clearActiveNote();
    };

    const deleteNote = (noteId: string) => {
        localStorage.removeItem(noteId);
        notes.value = notes.value.filter((note) => note.id !== noteId);
        if (activeNoteId.value === noteId) {
            clearActiveNote();
        }
    };

    /** Re-create a deleted note (used by the "Undo" toast). */
    const restoreNote = (meta: NoteMeta, content: string) => {
        setNoteContent(meta.id, content);
        notes.value = sortAndTrimNotes([
            ...notes.value.filter((note) => note.id !== meta.id),
            meta,
        ]);
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
                title: titleFor(content, note.file),
                updatedAt: note.updatedAt,
                ...(note.file ? { file: note.file } : {}),
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
        pendingFile.value = null;
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

    /** Start a new note from an opened file, remembering its name/type for saving later. */
    const newNoteFromFile = (content: string, file: FileMeta) => {
        newNote();
        pendingFile.value = file;
        value.value = content; // the App watcher persists it and attaches `pendingFile`
    };

    // File details of the active note (or of the file just opened but not yet saved).
    const activeFile = computed<FileMeta | null>(
        () => notes.value.find((note) => note.id === activeNoteId.value)?.file ?? pendingFile.value,
    );

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
        activeFile,
        newNoteFromFile,
        openNote,
        newNote,
        deleteNote,
        clearActiveNote,
        initializeNotes,
        saveOrDeleteCurrentNote,
        createNote,
        restoreNote,
        getNoteContent,
    };
};
