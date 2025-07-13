<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLanguageClass } from '../lib/use-language-class';

const value = defineModel<string>({
    default: '',
    type: String,
    required: true
});

const classes = ref<string>(useLanguageClass(value.value));

watch(value, (newValue) => {
    classes.value = useLanguageClass(newValue);
});
</script>

<template>
    <textarea v-model="value" id="editor"
        class="editor w-full h-screen p-4 pb-7 text-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-none outline-none resize-none font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        :class="classes" placeholder="Type your text here...&#10;&#10;or press `cmd + o` to open file." />
</template>