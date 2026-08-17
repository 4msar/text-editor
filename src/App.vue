<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import StatusBar from './components/StatusBar.vue';
import Editor from './components/Editor.vue';
import { useKeyboardShortcut } from './lib/use-keyboard-shortcut';
import SettingDialog from './components/SettingDialog.vue';
import { useStorage } from '@vueuse/core';
import { hanbleDownload } from './lib/utils';
import type { NoteMeta, Settings } from './type';
import RecentNotesSidebar from './components/RecentNotesSidebar.vue';

const inputRef = ref<HTMLTextAreaElement | null>(null);
const settingDialogOpen = ref(false);
const sidebarOpen = ref(false);
const value = ref('');
const activeNoteId = ref('');
const isLoadingNote = ref(false);
const settings = useStorage<Settings>('settings', {
  fontSize: '16',
  ui: 'auto',
  showLogo: true,
  newNoteBehavior: 'open-last',
});
const notes = useStorage<NoteMeta[]>('text-editor-notes', []);
const activeNoteInStorage = useStorage('text-editor-active-note', '');
const noteCounter = useStorage('text-editor-note-counter', 0);
const sidebarEnabled = computed(() => settings.value.newNoteBehavior === 'start-fresh');
const MAX_NOTES = 50;
const LEGACY_NOTE_KEY = 'text-editor-content';

const getNoteContent = (noteId: string) => localStorage.getItem(noteId) ?? '';
const setNoteContent = (noteId: string, content: string) => localStorage.setItem(noteId, content);

const normalizeTitle = (content: string) => {
  const clean = content.replace(/\s+/g, ' ').trim();
  return (clean || 'Untitled note').slice(0, 50);
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
  const existing = notes.value.find((note) => note.id === noteId);
  const updatedAt = touch ? Date.now() : existing?.updatedAt ?? Date.now();
  const next = notes.value.filter((note) => note.id !== noteId);
  next.push({
    id: noteId,
    title: normalizeTitle(content),
    updatedAt,
  });
  notes.value = sortAndTrimNotes(next);
};

const createNote = (content = '') => {
  syncCounterWithExistingNotes();
  noteCounter.value += 1;
  const noteId = `note_${noteCounter.value}`;
  setNoteContent(noteId, content);
  upsertNoteMeta(noteId, content, true);
  return noteId;
};

const ensureAtLeastOneNote = () => {
  if (notes.value.length === 0) {
    const legacy = localStorage.getItem(LEGACY_NOTE_KEY) ?? '';
    const firstNoteId = createNote(legacy);
    if (localStorage.getItem(LEGACY_NOTE_KEY) !== null) {
      localStorage.removeItem(LEGACY_NOTE_KEY);
    }
    return firstNoteId;
  }

  notes.value.forEach((note) => {
    if (localStorage.getItem(note.id) === null) {
      setNoteContent(note.id, '');
    }
  });

  return notes.value[0]?.id ?? createNote('');
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
  syncCounterWithExistingNotes();
  const fallbackNoteId = ensureAtLeastOneNote();

  if (settings.value.newNoteBehavior === 'start-fresh') {
    const freshNoteId = createNote('');
    openNote(freshNoteId);
    return;
  }

  const hasActiveNote = notes.value.some((note) => note.id === activeNoteInStorage.value);
  openNote(hasActiveNote ? activeNoteInStorage.value : fallbackNoteId);
};

const handleOpenNote = (noteId: string) => {
  openNote(noteId);
  sidebarOpen.value = false;
};

watch(sidebarEnabled, (enabled) => {
  if (!enabled) {
    sidebarOpen.value = false;
  }
});

watch(
  value,
  (newValue, oldValue) => {
    if (isLoadingNote.value || !activeNoteId.value || newValue === oldValue) {
      return;
    }
    setNoteContent(activeNoteId.value, newValue);
    upsertNoteMeta(activeNoteId.value, newValue, true);
  },
  { flush: 'sync' }
);

// add event listener `cmd + o` or `ctrl + o` to open file
useKeyboardShortcut(['cmd+o', 'ctrl+o'], () => {
  inputRef.value?.click();
});

// add event listener `cmd + ,` or `ctrl + ,` to open settings dialog
useKeyboardShortcut(['cmd+,', 'ctrl+,'], () => {
  settingDialogOpen.value = true;
});

useKeyboardShortcut(['cmd+s', 'ctrl+s'], () => {
  if (value.value) {
    hanbleDownload(value.value);
  }
});

// add drag and drop event listener to the main element
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      value.value = e.target?.result as string;
    };
    reader.readAsText(file);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};
const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
};

// Handle file open event
const handleFileOpen = (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  if (fileInput.files && fileInput.files.length > 0) {
    try {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        value.value = e.target?.result as string;
      };
      reader.readAsText(file);
    } catch (error) {
      alert('Error reading file: ' + error);
    }
  }
};

// Supported file type for opening files, all text files
const supportedFileType = '.txt,.md,.json,.js,.ts,.html,.css,.vue,.xml,.yaml,.yml,.csv,.log,.py,.java,.cpp,.c,.h,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.bat,.ps1,.sql,.r,.m,.pl,.lua,.dart,.jsx,.tsx,.scss,.sass,.less,.styl,.ini,.cfg,.conf,.env,.gitignore,.dockerfile,.makefile,.cmake,.toml,.lock,.properties,.gradle,.maven,.ant,.sbt,.clj,.cljs,.edn,.elm,.ex,.exs,.erl,.hrl,.fs,.fsx,.fsi,.ml,.mli,.hs,.lhs,.nim,.pas,.pp,.dpr,.asm,.s,.f,.f90,.f95,.f03,.f08,.for,.ftn,.cob,.cbl,.ada,.adb,.ads,.tcl,.vb,.vbs,.wsf,.wsh,.au3,.ahk,.nsi,.nsh,.iss,.tex,.bib,.cls,.sty,.dtx,.ins,.lof,.lot,.toc,.aux,.idx,.ind,.ilg,.glo,.gls,.fdb_latexmk,.fls,.synctex.gz,.bbl,.blg,.run.xml,.bcf,.xdv';

onMounted(() => {
  initializeNotes();
  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('dragleave', handleDragLeave);
  document.addEventListener('drop', handleDrop);
});

onUnmounted(() => {
  document.removeEventListener('dragover', handleDragOver);
  document.removeEventListener('dragleave', handleDragLeave);
  document.removeEventListener('drop', handleDrop);
});
</script>

<template>
  <main class="relative h-svh md:h-screen w-screen flex flex-col items-center justify-center">
    <RecentNotesSidebar :enabled="sidebarEnabled" :open="sidebarOpen" :notes="notes" :active-note-id="activeNoteId"
      @toggle="sidebarOpen = !sidebarOpen" @open-note="handleOpenNote" />
    <Editor v-model="value" />
    <input ref="inputRef" type="file" id="fileInput" class="hidden" :accept="supportedFileType"
      @change="handleFileOpen" />
    <StatusBar :value="value" @open-setting="settingDialogOpen = true" />
    <SettingDialog :open="settingDialogOpen" @close="settingDialogOpen = false" />
  </main>
</template>
