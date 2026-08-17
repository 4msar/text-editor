<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '../lib/utils';
import type { NoteMeta } from '../type';

const { notes, activeNoteId, enabled, open } = defineProps<{
    notes: NoteMeta[];
    activeNoteId: string;
    enabled: boolean;
    open: boolean;
}>();

defineEmits<{
    (e: 'toggle'): void;
    (e: 'open-note', id: string): void;
}>();

const recentNotes = computed(() => notes.slice(0, 50));

const displayTitle = (title: string) => {
    const normalized = title.trim();
    if (!normalized) {
        return 'Untitled note';
    }
    return normalized.slice(0, 50);
};
</script>

<template>
    <template v-if="enabled">
        <button type="button" title="Toggle recent notes" @click="$emit('toggle')"
            class="fixed z-40 left-0 top-1/2 -translate-y-1/2 rounded-r-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <svg class="size-4 transition-transform" :class="open ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>

        <aside class="fixed z-30 left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 transition-transform duration-200"
            :class="open ? 'translate-x-0' : '-translate-x-full'">
            <div class="h-full pt-4 pb-8 px-3 overflow-y-auto">
                <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Recent notes</h2>
                <ul class="space-y-2">
                    <li v-for="note in recentNotes" :key="note.id">
                        <button type="button" @click="$emit('open-note', note.id)"
                            class="w-full text-left rounded-md border px-2 py-1.5 transition-colors"
                            :class="note.id === activeNoteId
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'">
                            <p class="text-xs font-medium truncate">{{ displayTitle(note.title) }}</p>
                            <p class="text-[10px] opacity-80">{{ formatDate(new Date(note.updatedAt)) }}</p>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    </template>
</template>
