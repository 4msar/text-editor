<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useLanguageClass } from '../lib/use-language-class';
import { useStorage } from '@vueuse/core';
import { inputShortcutHandler } from '../lib/utils';

const inputRef = ref<HTMLTextAreaElement | null>(null);

const value = defineModel<string>({
    default: '',
    type: String,
    required: true
});

const classes = ref<string>(useLanguageClass(value.value));

watch(value, (newValue) => {
    classes.value = useLanguageClass(newValue);
});

onMounted(() => {
    if (inputRef.value) {
        inputRef.value.addEventListener('keydown', inputShortcutHandler(inputRef));
    }
});

// Clean up event listener on unmount
onUnmounted(() => {
    if (inputRef.value) {
        inputRef.value.removeEventListener('keydown', inputShortcutHandler(inputRef));
    }
});

const settings = useStorage("settings", {
    fontSize: "16px",
});


const placeholder = "Start writing...\n\nPress `cmd + o` to open file.\nPress `cmd + ,` to open settings dialog.\n\nYou can also drag and drop files here.\n\nPress `cmd + b` for bold, `cmd + i` for italic, `cmd + u` for underline, and `cmd + k` for link.";
</script>

<template>
    <textarea ref="inputRef" v-model="value" id="editor" autofocus
        class="editor w-full h-screen p-4 pb-7 text-base bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-none outline-none resize-none font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        :class="classes" :placeholder="placeholder" :style="{ fontSize: `${settings.fontSize}px` }" />
</template>