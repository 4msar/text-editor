<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import StatusBar from './components/StatusBar.vue';
import Editor from './components/Editor.vue';
import { useKeyboardShortcut } from './lib/use-keyboard-shortcut';
import SettingDialog from './components/SettingDialog.vue';
import { useStorage } from '@vueuse/core';
import { hanbleDownload } from './lib/utils';
import type { Settings } from './type';
import RecentNotesSidebar from './components/RecentNotesSidebar.vue';
import { useNotes } from './lib/use-notes';
import { useFileHandling } from './lib/use-file-handling';
import { supportedFileType } from './lib/language-detection.ts';

// UI State
const inputRef = ref<HTMLTextAreaElement | null>(null);
const settingDialogOpen = ref(false);
const sidebarOpen = ref(false);

// Settings
const settings = useStorage<Settings>('settings', {
  fontSize: '16',
  ui: 'auto',
  showLogo: true,
  newNoteBehavior: 'open-last',
});

// Notes Management
const {
  notes,
  activeNoteId,
  isLoadingNote,
  value,
  openNote,
  deleteNote,
  initializeNotes,
  saveOrDeleteCurrentNote,
} = useNotes(settings);

// File Handling
const { handleFileOpen, attachEventListeners, detachEventListeners } = useFileHandling(value);

// Computed
const sidebarEnabled = computed(() => settings.value.newNoteBehavior === 'start-fresh');

// Event Handlers
const handleOpenNote = (noteId: string) => {
  openNote(noteId);
  sidebarOpen.value = false;
};

const handleDeleteNote = (noteId: string) => {
  const wasActive = activeNoteId.value === noteId;
  deleteNote(noteId);
  if (wasActive && notes.value[0]) {
    openNote(notes.value[0].id);
  }
};

const handleFocus = () => {
  if (sidebarEnabled.value) {
    sidebarOpen.value = false;
  }
};

// Watchers
watch(sidebarEnabled, (enabled) => {
  if (!enabled) {
    sidebarOpen.value = false;
  }
});

watch(
  value,
  (newValue, oldValue) => {
    if (isLoadingNote.value || newValue === oldValue) {
      return;
    }
    saveOrDeleteCurrentNote(newValue);
  }
);

// Keyboard Shortcuts
useKeyboardShortcut(['cmd+o', 'ctrl+o'], () => {
  inputRef.value?.click();
});

useKeyboardShortcut(['cmd+,', 'ctrl+,'], () => {
  settingDialogOpen.value = true;
});

useKeyboardShortcut(['cmd+s', 'ctrl+s'], () => {
  if (value.value) {
    hanbleDownload(value.value);
  }
});

// Lifecycle
onMounted(() => {
  initializeNotes();
  attachEventListeners();
});

onUnmounted(() => {
  detachEventListeners();
});
</script>

<template>
  <main class="relative h-svh md:h-screen w-screen flex flex-col items-center justify-center">
    <RecentNotesSidebar :enabled="sidebarEnabled" :open="sidebarOpen" :notes="notes" :active-note-id="activeNoteId"
      @toggle="sidebarOpen = !sidebarOpen" @open-note="handleOpenNote" @delete-note="handleDeleteNote" />
    <Editor v-model="value" @onFocus="handleFocus" />
    <input ref="inputRef" type="file" id="fileInput" class="hidden" :accept="supportedFileType"
      @change="handleFileOpen" />
    <StatusBar :value="value" @open-setting="settingDialogOpen = true" />
    <SettingDialog :open="settingDialogOpen" @close="settingDialogOpen = false" />
  </main>
</template>
