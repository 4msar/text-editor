<script setup lang="ts">
import { ref } from 'vue';
import { helpTexts, placeholderTexts } from '../lib/data';
import { useKeyboardShortcut } from '../lib/use-keyboard-shortcut';

const helpDialogOpen = ref(false);

// add event listener `cmd + ,` or `ctrl + ,` to open settings dialog
useKeyboardShortcut(['cmd+/', 'ctrl+/'], () => {
    helpDialogOpen.value = true;
});
</script>

<template>
    <button type="button" title="Help" class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 fill-slate-600 dark:fill-white transition-colors" @click="helpDialogOpen = !helpDialogOpen">
        <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    </button>

    <div v-if="helpDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center dark:bg-slate-900/50 bg-slate-200/50"
        @click.self="$emit('close')" style="backdrop-filter: blur(2px);">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md space-y-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl text-black dark:text-white font-semibold">Help</h2>
                <button type="button" title="Close" class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors" @click="helpDialogOpen = false">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </button>
            </div>

            
            <p class="text-gray-600 dark:text-gray-400 mb-4 space-y-4 whitespace-pre-wrap">
                {{ helpTexts.join('\n') }}
            </p>
            
        </div>
    </div>
</template>
