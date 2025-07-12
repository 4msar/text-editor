<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import StatusBar from './components/StatusBar.vue';

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
    if(newVal){
      window.localStorage.setItem('text-editor-content', newVal);
    }
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
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      value.value = e.target?.result as string;
    };
    reader.readAsText(file);
  }
};

</script>

<template>
  <main class="relative h-screen w-screen">
    <textarea v-model="value"
      class="w-full h-screen p-4 text-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-none outline-none resize-none font-mono"
      placeholder="Type your text here...&#10;&#10;or press `cmd + o` to open file."></textarea>
    <input ref="inputRef" type="file" id="fileInput" class="hidden" accept="text/plain" @change="handleFileOpen" />
    <StatusBar :value="value" />
  </main>
</template>
