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
    (e: 'new-note'): void;
    (e: 'open-note', id: string): void;
    (e: 'delete-note', id: string): void;
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
                <div class="mb-3 flex items-center justify-between gap-2">
                    <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent notes</h2>
                    <button type="button" @click="$emit('new-note')"
                        class="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-3">
                            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        New note
                    </button>
                </div>
                <ul v-if="recentNotes.length > 0" class="space-y-2">
                    <li v-for="note in recentNotes" :key="note.id">
                        <div class="w-full rounded-md border px-2 py-1.5 transition-colors"
                            :class="note.id === activeNoteId
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'">
                            <div class="flex items-start justify-between gap-2">
                                <button type="button" @click="$emit('open-note', note.id)" class="flex-1 text-left min-w-0">
                                    <p class="text-xs font-medium truncate">{{ displayTitle(note.title) }}</p>
                                    <p class="text-[10px] opacity-80">{{ formatDate(new Date(note.updatedAt)) }}</p>
                                </button>
                                <button type="button" title="Delete note" @click.stop="$emit('delete-note', note.id)"
                                    class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-3" stroke-width="2">
                                        <path d="M3 6h18" stroke-linecap="round" />
                                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                        <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                                        <path d="M10 11v6M14 11v6" stroke-linecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
                <p v-else class="text-xs text-slate-500 dark:text-slate-400">No saved notes yet.</p>
            </div>
        </aside>
    </template>
</template>
