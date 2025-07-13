<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLanguageClass } from '../lib/use-language-class';
import { useStorage } from '@vueuse/core';

const value = defineModel<string>({
    default: '',
    type: String,
    required: true
});

const classes = ref<string>(useLanguageClass(value.value));

watch(value, (newValue) => {
    classes.value = useLanguageClass(newValue);
});

const settings = useStorage("settings", {
    fontSize: "16px",
});

</script>

<template>
    <textarea v-model="value" id="editor" autofocus
        class="editor w-full h-screen p-4 pb-7 text-base bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-none outline-none resize-none font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        :class="classes"
        placeholder="Start writing...&#10;&#10;press `cmd + o` to open file.&#10;press `cmd + ,` to open settings dialog.&#10;&#10;You can also drag and drop files here."
        :style="{ fontSize: `${settings.fontSize}px` }" />
</template>