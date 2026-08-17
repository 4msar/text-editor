<script setup lang="ts">
import { hanbleDownload } from './../lib/utils';

const { value } = defineProps<{
    value: string;
}>();

const download = () => {
    if (value) {
        hanbleDownload(value);
    }
}
</script>

<template>
    <button type="button" title="Download as text"
        class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
        @click="download">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M12 18v-6" />
            <path d="m9 15 3 3 3-3" />
        </svg>
    </button>
</template>