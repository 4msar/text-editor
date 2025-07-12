<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import StatusBar from './components/StatusBar.vue';
import Editor from './components/Editor.vue';

const inputRef = ref<HTMLTextAreaElement | null>(null);
const value = ref<string>(window.localStorage.getItem('text-editor-content') ?? '');

// Load initial content from localStorage
onMounted(() => {
  const savedContent = window.localStorage.getItem('text-editor-content') ?? '';
  if (savedContent) {

    value.value = savedContent;
  }
});

watch(
  ()=>value.value, 
  (newVal:string) => {
    window.localStorage.setItem('text-editor-content', newVal ?? '');
}, { immediate: true });

// add event listener cmd + o to open file
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
    event.preventDefault();
    
    inputRef.value?.click();
  }
});

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

</script>

<template>
  <main class="relative h-screen w-screen">
    <Editor v-model="value" />
    <input ref="inputRef" type="file" id="fileInput" class="hidden" accept="text/plain" @change="handleFileOpen" />
    <StatusBar :value="value" />
  </main>
</template>
