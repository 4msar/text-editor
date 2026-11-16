<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { MotionConfig, motion } from "motion-v";
import { useEventListener, useMediaQuery } from "@vueuse/core";
import StatusBar from "./components/StatusBar.vue";
import Editor, { type CursorInfo } from "./components/Editor.vue";
import SettingDialog from "./components/SettingDialog.vue";
import HelpDialog from "./components/HelpDialog.vue";
import RecentNotesSidebar from "./components/RecentNotesSidebar.vue";
import DropOverlay from "./components/DropOverlay.vue";
import Toaster from "./components/ui/Toaster.vue";
import { useKeyboardShortcut } from "./lib/use-keyboard-shortcut";
import { handleDownload } from "./lib/utils";
import { useNotes } from "./lib/use-notes";
import { useSettings } from "./lib/use-settings";
import { useFileHandling } from "./lib/use-file-handling";
import { useDarkMode } from "./lib/use-dark-mode";
import { toast } from "./lib/use-toast";
import { supportedFileType } from "./lib/language-detection.ts";

// UI State
const inputRef = ref<HTMLInputElement | null>(null);
const editorRef = ref<InstanceType<typeof Editor> | null>(null);
const settingDialogOpen = ref(false);
const helpDialogOpen = ref(false);
const sidebarOpen = ref(false);
const cursor = ref<CursorInfo>({ line: 1, column: 1, selected: 0 });
const saved = ref(false);
// Bumped only on explicit note switches (not when typing creates a note), drives the editor transition.
const switchKey = ref(0);
let savedTimer: number | undefined;

const settings = useSettings();
useDarkMode();

// Pinned sidebar: stays open and pushes the editor aside (desktop widths only).
const SIDEBAR_WIDTH = 288;
const isDesktop = useMediaQuery("(min-width: 768px)");
const pinned = computed(() => settings.value.sidebarPinned && isDesktop.value);
const sidebarVisible = computed(() => pinned.value || sidebarOpen.value);

const toggleSidebar = () => {
    if (pinned.value) {
        settings.value.sidebarPinned = false;
        sidebarOpen.value = false;
        return;
    }
    sidebarOpen.value = !sidebarOpen.value;
};

const togglePin = () => {
    const next = !settings.value.sidebarPinned;
    settings.value.sidebarPinned = next;
    // Unpinning leaves the overlay open so the list doesn't vanish under the cursor.
    sidebarOpen.value = !next;
    focusEditor();
};

// Notes Management
const {
    notes,
    activeNoteId,
    isLoadingNote,
    value,
    openNote,
    newNote,
    deleteNote,
    restoreNote,
    getNoteContent,
    initializeNotes,
    saveOrDeleteCurrentNote,
} = useNotes(settings);

const focusEditor = () => nextTick(() => editorRef.value?.focus());
const markSwitch = () => switchKey.value++;

// File Handling: every opened/dropped file becomes its own note instead of overwriting the current one.
const { isDragging, handleFileOpen, attachEventListeners, detachEventListeners } = useFileHandling((content) => {
    newNote();
    value.value = content;
    markSwitch();
    sidebarOpen.value = false;
    focusEditor();
});

// Event Handlers
const handleOpenNote = (noteId: string) => {
    openNote(noteId);
    markSwitch();
    sidebarOpen.value = false;
    focusEditor();
};

const handleNewNote = () => {
    newNote();
    markSwitch();
    sidebarOpen.value = false;
    focusEditor();
};

const handleDeleteNote = (noteId: string) => {
    const meta = notes.value.find((note) => note.id === noteId);
    if (!meta) return;
    const content = getNoteContent(noteId);
    const wasActive = activeNoteId.value === noteId;

    deleteNote(noteId);
    if (wasActive) {
        if (notes.value[0]) openNote(notes.value[0].id);
        markSwitch();
    }

    toast("Note deleted", {
        action: {
            label: "Undo",
            run: () => {
                restoreNote(meta, content);
                if (wasActive) {
                    openNote(meta.id);
                    markSwitch();
                }
            },
        },
    });
};

const download = () => {
    if (!value.value) {
        toast("Nothing to download yet");
        return;
    }
    const name = handleDownload(value.value);
    toast.success(`Downloaded ${name}`);
};

const handleFocus = () => {
    sidebarOpen.value = false;
};

// Persist edits and flash the "Saved" indicator.
watch(value, (newValue, oldValue) => {
    if (isLoadingNote.value || newValue === oldValue) {
        return;
    }
    // Opening/switching notes changes `value` too; skip when nothing actually changed on disk.
    if (activeNoteId.value && getNoteContent(activeNoteId.value) === newValue) {
        return;
    }
    saveOrDeleteCurrentNote(newValue);
    if (newValue.trim()) {
        saved.value = true;
        window.clearTimeout(savedTimer);
        savedTimer = window.setTimeout(() => (saved.value = false), 1500);
    }
});

// Keyboard Shortcuts
useKeyboardShortcut(["cmd+o", "ctrl+o"], () => inputRef.value?.click());
useKeyboardShortcut(["cmd+,", "ctrl+,"], () => {
    helpDialogOpen.value = false;
    settingDialogOpen.value = true;
});
useKeyboardShortcut(["cmd+/", "ctrl+/"], () => {
    settingDialogOpen.value = false;
    helpDialogOpen.value = !helpDialogOpen.value;
});
useKeyboardShortcut(["cmd+s", "ctrl+s"], download);
useKeyboardShortcut("alt+n", handleNewNote);
useKeyboardShortcut("alt+l", toggleSidebar);
// Dialogs handle (and preventDefault) their own Escape first; only then close the sidebar.
useEventListener(window, "keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape" && !event.defaultPrevented && sidebarOpen.value && !pinned.value) {
        sidebarOpen.value = false;
        focusEditor();
    }
});

// Lifecycle
onMounted(() => {
    initializeNotes();
    attachEventListeners();
});

onUnmounted(() => {
    detachEventListeners();
    window.clearTimeout(savedTimer);
});
</script>

<template>
    <MotionConfig reducedMotion="user">
        <main class="relative h-svh w-screen overflow-hidden md:h-screen">
            <RecentNotesSidebar
                :open="sidebarVisible"
                :pinned="pinned"
                :notes="notes"
                :active-note-id="activeNoteId"
                @toggle="toggleSidebar"
                @toggle-pin="togglePin"
                @close="sidebarOpen = false"
                @new-note="handleNewNote"
                @open-note="handleOpenNote"
                @delete-note="handleDeleteNote"
            />
            <motion.div
                class="absolute inset-y-0 right-0 flex flex-col items-center justify-center"
                :initial="false"
                :animate="{ left: pinned ? SIDEBAR_WIDTH : 0 }"
                :transition="{ type: 'spring', stiffness: 380, damping: 36 }"
            >
            <Editor ref="editorRef" v-model="value" :switch-key="switchKey" @on-focus="handleFocus" @cursor="cursor = $event" />
            <input ref="inputRef" id="fileInput" type="file" class="hidden" :accept="supportedFileType" @change="handleFileOpen" />
            <StatusBar
                :value="value"
                :cursor="cursor"
                :saved="saved"
                @open-setting="settingDialogOpen = true"
                @open-help="helpDialogOpen = true"
                @open-file="inputRef?.click()"
                @download="download"
            />
            </motion.div>
            <SettingDialog :open="settingDialogOpen" @close="settingDialogOpen = false" />
            <HelpDialog :open="helpDialogOpen" @close="helpDialogOpen = false" />
            <DropOverlay :show="isDragging" />
            <Toaster />
        </main>
    </MotionConfig>
</template>
