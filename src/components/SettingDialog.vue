<script setup lang="ts">
import { useDarkMode, type Theme } from '../lib/use-dark-mode';
import { useStorage } from '@vueuse/core';

defineProps<{
    open: boolean;
}>();

defineEmits<{
    (e: 'close'): void;
}>();

const { theme, setTheme } = useDarkMode();

import type { Settings } from '../type';

const settings = useStorage<Settings>("settings", {
    fontSize: "16",
    ui: "auto",
    showLogo: true
});


const handleThemeChange = (event: Event) => {
    const selectElement = event.target as HTMLSelectElement;
    const selectedTheme = selectElement.value as Theme;
    setTheme(selectedTheme);
};

</script>
<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center dark:bg-slate-900/50 bg-slate-200/50"
        @click.self="$emit('close')" style="backdrop-filter: blur(2px);">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md space-y-6">
            <h2 class="text-xl text-black dark:text-white font-semibold mb-4">Settings</h2>
            <div class="text-gray-600 dark:text-gray-400 mb-4 space-y-4 ">
                <fieldset>
                    <legend class="text-lg font-medium">Theme</legend>
                    <p class="text-sm">Choose your preferred theme:</p>
                    <select @change="handleThemeChange" v-model="theme"
                        class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                </fieldset>
                <fieldset>
                    <legend class="text-lg font-medium">UI</legend>
                    <p class="text-sm">Choose your preferred UI:</p>
                    <select v-model="settings.ui"
                        class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white">
                        <option value="auto">Auto</option>
                        <option value="box">Box</option>
                        <option value="fluid">Full Width</option>
                    </select>
                </fieldset>
                <fieldset v-if="settings.ui === 'box'" class="flex items-center justify-between">
                    <div>
                        <legend class="text-lg font-medium">Logo</legend>
                        <p class="text-sm">Show logo in the editor</p>
                    </div>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" :checked="settings.showLogo" class="sr-only peer"
                            v-model="settings.showLogo" />
                        <div
                            class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                        </div>
                        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show</span>
                    </label>
                </fieldset>
                <fieldset>
                    <legend class="text-lg font-medium">Font Size</legend>
                    <p class="text-sm">Choose your preferred font size:</p>
                    <div class="flex items-center gap-2">
                        <input type="range" min="12" max="32" step="1" v-model="settings.fontSize"
                            class="flex-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                        <span class="text-sm text-gray-600 dark:text-gray-400">{{ settings.fontSize }}px</span>
                    </div>
                </fieldset>
            </div>
            <div class="mt-4 flex justify-between items-end">
                <button @click="$emit('close')"
                    class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                    Close
                </button>

                <a href="https://msar.me/contact" target="_blank" rel="noopener noreferrer"
                    class="text-sm text-gray-500 hover:underline" title="Contact me">
                    <svg viewBox="0 0 64 64" fill="currentColor" class="size-3">
                        <path
                            d="M62.99 2.562a1.012 1.012 0 0 0-1.23-.84L7.403 15.207a1 1 0 0 0-.45 1.692l13.933 13.358-2.765 17.15c-.107.67.497 1.257 1.159 1.144l18.08-3.132 17.183 9.699a1 1 0 0 0 1.483-.738l6.964-51.554a.995.995 0 0 0-.002-.264zM9.646 16.71 56.891 4.99 22.255 28.797 9.646 16.71zm27.268 26.755L20.32 46.341l2.5-15.505L58.863 6.062 36.915 43.466zm17.328 9.184L38.92 44.001 60.343 7.492l-6.1 45.158zM14.444 51.61l-4.695 5.209a1 1 0 1 0 1.485 1.339l4.695-5.21a1 1 0 1 0-1.485-1.338zM5.948 29.056l-4.691 5.209a1 1 0 0 0 1.486 1.338l4.691-5.209a1 1 0 0 0-1.486-1.338zM40.816 55.433l-4.69 5.205a1 1 0 1 0 1.485 1.339l4.69-5.205a1 1 0 1 0-1.485-1.339z" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
</template>