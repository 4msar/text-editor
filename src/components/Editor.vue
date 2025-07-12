<script setup lang="ts">

const value = defineModel<string>({
    default: '',
    type: String,
    required: true
});
</script>

<template>
    <textarea v-model="value" id="editor"
        class="editor w-full h-screen p-4 pb-7 text-lg bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border-none outline-none resize-none font-mono"
        placeholder="Type your text here...&#10;&#10;or press `cmd + o` to open file." />
</template>