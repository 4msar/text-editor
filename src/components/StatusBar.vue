<script setup lang="ts">
import { ref } from 'vue';
import Time from './Time.vue';

const {value}=defineProps<{
  value: string;
}>();

const darkTheme = ref(document.documentElement.classList.contains('dark'));

const toggleTheme = () => {
    document.documentElement.classList.contains('dark') ? document.documentElement.classList.remove('dark') : document.documentElement.classList.add('dark');

    darkTheme.value = document.documentElement.classList.contains('dark');
};
</script>

<template>
    <div class="absolute bottom-0 left-0 w-full max-h-7">
        <div
            class="flex items-center justify-between w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-1 border-t border-neutral-300 dark:border-neutral-700 text-xs">

            <!-- add a gap separator -->
            <div
                class="flex justify-start items-center *:not-[:last-child]:after:content-['|'] *:not-[:last-child]:after:px-1">
                <span>Character: {{ value.length }}</span>
                <span>Word: {{ value.trim().split(/\s+/).filter(Boolean).length }}</span>
                <span>Line: {{ value.split('\n').length }}</span>
            </div>

            <div
                class="justify-end items-center hidden md:flex *:not-[:last-child]:after:content-['|'] *:not-[:last-child]:after:px-1">
                <span>Mode: <span class="cursor-pointer" @click="toggleTheme" title="Click to switch theme">{{ darkTheme
                        ? 'Dark' :
                        'Light' }}</span></span>
                <span class="flex items-center gap-2">Time: <Time /></span>
            </div>
        </div>
    </div>

</template>