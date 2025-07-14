<script setup lang="ts">
import { ref } from 'vue';
import StatusBar from './components/StatusBar.vue';
import Editor from './components/Editor.vue';
import { useKeyboardShortcut } from './lib/use-keyboard-shortcut';
import SettingDialog from './components/SettingDialog.vue';
import { useStorage } from '@vueuse/core';

const inputRef = ref<HTMLTextAreaElement | null>(null);
const settingDialogOpen = ref(false);
const value = useStorage('text-editor-content', '');

// add event listener `cmd + o` or `ctrl + o` to open file
useKeyboardShortcut(['cmd+o', 'ctrl+o'], () => {
  inputRef.value?.click();
});

// add event listener `cmd + ,` or `ctrl + ,` to open settings dialog
useKeyboardShortcut(['cmd+,', 'ctrl+,'], () => {
  settingDialogOpen.value = true;
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
// Add drag and drop event listeners to the main element
document.addEventListener('dragover', handleDragOver);
document.addEventListener('dragleave', handleDragLeave);
document.addEventListener('drop', handleDrop);

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
</script>

<template>
  <main class="relative h-screen w-screen flex flex-col items-center justify-center">
    <Editor v-model="value" />
    <input ref="inputRef" type="file" id="fileInput" class="hidden" :accept="supportedFileType"
      @change="handleFileOpen" />
    <StatusBar :value="value" @open-setting="settingDialogOpen = true" />
    <SettingDialog :open="settingDialogOpen" @close="settingDialogOpen = false" />
  </main>
</template>
