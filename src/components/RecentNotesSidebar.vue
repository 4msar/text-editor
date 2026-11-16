<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { AnimatePresence, motion } from "motion-v";
import { useNow } from "@vueuse/core";
import { formatRelative } from "../lib/utils";
import { altKey } from "../lib/data";
import type { NoteMeta } from "../type";

const props = defineProps<{
    notes: NoteMeta[];
    activeNoteId: string;
    open: boolean;
    pinned: boolean;
}>();

const emit = defineEmits<{
    (e: "toggle"): void;
    (e: "toggle-pin"): void;
    (e: "close"): void;
    (e: "new-note"): void;
    (e: "open-note", id: string): void;
    (e: "delete-note", id: string): void;
}>();

const query = ref("");
const searchRef = ref<HTMLInputElement | null>(null);
// Re-render relative timestamps every minute.
const now = useNow({ interval: 60_000 });

const filteredNotes = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return props.notes;
    return props.notes.filter((note) => {
        if (note.title.toLowerCase().includes(q)) return true;
        return (localStorage.getItem(note.id) ?? "").toLowerCase().includes(q);
    });
});

const relative = (ts: number) => {
    void now.value;
    return formatRelative(ts);
};

watch(
    () => props.open,
    async (open) => {
        if (open && !props.pinned) {
            await nextTick();
            searchRef.value?.focus({ preventScroll: true });
        } else {
            query.value = "";
        }
    },
);

const onSearchKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        event.stopPropagation();
        if (query.value) query.value = "";
        else emit("close");
    } else if (event.key === "Enter" && filteredNotes.value[0]) {
        emit("open-note", filteredNotes.value[0].id);
    }
};

const spring = { type: "spring", stiffness: 380, damping: 36 } as const;
</script>

<template>
    <AnimatePresence :initial="false">
        <motion.button
            v-if="!pinned"
            key="tab"
            type="button"
            :title="`Notes (${altKey}+L)`"
            aria-label="Toggle notes list"
            :aria-expanded="open"
            class="fixed top-1/2 left-0 z-40 -translate-y-1/2 rounded-r-lg border border-l-0 border-slate-300 bg-white/90 px-1 py-3 text-slate-600 shadow-sm backdrop-blur transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:text-white"
            :initial="{ opacity: 0, x: 288 }"
            :animate="{ opacity: 1, x: open ? 288 : 0 }"
            :exit="{ opacity: 0, x: 288 }"
            :whileHover="{ paddingRight: 8 }"
            :transition="spring"
            @click="emit('toggle')"
        >
            <motion.svg
                class="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                :animate="{ rotate: open ? 180 : 0 }"
                :transition="spring"
            >
                <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </motion.svg>
        </motion.button>
    </AnimatePresence>

    <AnimatePresence>
        <motion.div
            v-if="open && !pinned"
            key="scrim"
            class="fixed inset-0 z-30 bg-slate-900/20 md:hidden"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            @click="emit('close')"
        />
    </AnimatePresence>

    <motion.aside
        class="fixed top-0 left-0 z-30 flex h-full w-72 flex-col border-r border-slate-300 bg-white/95 backdrop-blur transition-shadow dark:border-slate-700 dark:bg-slate-900/95"
        :class="pinned ? 'shadow-none' : 'shadow-xl'"
        :initial="false"
        :animate="{ x: open ? 0 : -300, opacity: open ? 1 : 0.6 }"
        :transition="spring"
        :aria-hidden="!open"
        :inert="!open"
    >
        <div class="space-y-3 px-3 pt-4 pb-3">
            <div class="flex items-center justify-between gap-2">
                <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Notes
                    <motion.span
                        :key="notes.length"
                        class="ml-1 inline-block rounded-full bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        :initial="{ scale: 0.6 }"
                        :animate="{ scale: 1 }"
                    >
                        {{ notes.length }}
                    </motion.span>
                </h2>
                <div class="flex items-center gap-1">
                    <motion.button
                        type="button"
                        :title="pinned ? 'Unpin sidebar' : 'Pin sidebar open'"
                        :aria-label="pinned ? 'Unpin sidebar' : 'Pin sidebar open'"
                        :aria-pressed="pinned"
                        :whileHover="{ scale: 1.1 }"
                        :whilePress="{ scale: 0.88 }"
                        class="hidden size-6 items-center justify-center rounded-md transition-colors md:inline-flex"
                        :class="
                            pinned
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        "
                        @click="emit('toggle-pin')"
                    >
                        <motion.svg
                            class="size-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :animate="{ rotate: pinned ? 0 : 45 }"
                            :transition="spring"
                        >
                            <path d="M12 17v5" />
                            <path
                                :fill="pinned ? 'currentColor' : 'none'"
                                d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"
                            />
                        </motion.svg>
                    </motion.button>
                    <motion.button
                        type="button"
                        :title="`New note (${altKey}+N)`"
                        :whileHover="{ scale: 1.04 }"
                        :whilePress="{ scale: 0.95 }"
                        class="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-blue-700"
                        @click="emit('new-note')"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="size-3">
                            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        New
                    </motion.button>
                </div>
            </div>
            <label class="relative block">
                <svg
                    class="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                </svg>
                <input
                    ref="searchRef"
                    v-model="query"
                    type="search"
                    placeholder="Search notes…"
                    class="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pr-2 pl-7 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    @keydown="onSearchKeydown"
                />
            </label>
        </div>

        <div class="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-10">
            <ul class="space-y-1.5 mt-1">
                <AnimatePresence :initial="false">
                    <motion.li
                        v-for="(note, index) in filteredNotes"
                        :key="note.id"
                        layout
                        :initial="{ opacity: 0, x: -16 }"
                        :animate="{ opacity: 1, x: 0, transition: { delay: open ? Math.min(index, 10) * 0.02 : 0 } }"
                        :exit="{ opacity: 0, x: -40, height: 0, marginTop: 0, transition: { duration: 0.2 } }"
                        :transition="spring"
                        class="group relative"
                    >
                        <motion.span
                            v-if="note.id === activeNoteId"
                            layoutId="active-note"
                            class="absolute inset-0 rounded-lg bg-blue-50 ring-1 ring-blue-300 dark:bg-blue-950/50 dark:ring-blue-800"
                            :transition="spring"
                        />
                        <div
                            class="relative flex items-start gap-1 rounded-lg px-2 py-1.5 transition-colors"
                            :class="
                                note.id === activeNoteId
                                    ? 'text-blue-700 dark:text-blue-200'
                                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                            "
                        >
                            <button type="button" class="min-w-0 flex-1 text-left" @click="emit('open-note', note.id)">
                                <p class="truncate text-xs font-medium">{{ note.title || "Untitled note" }}</p>
                                <p class="text-[10px] opacity-70">{{ relative(note.updatedAt) }}</p>
                            </button>
                            <motion.button
                                type="button"
                                title="Delete note"
                                aria-label="Delete note"
                                :whileHover="{ scale: 1.15 }"
                                :whilePress="{ scale: 0.85 }"
                                class="shrink-0 rounded p-1 text-slate-400 opacity-100 transition-opacity hover:bg-rose-100 hover:text-rose-600 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 dark:hover:bg-rose-950/60 dark:hover:text-rose-300"
                                @click.stop="emit('delete-note', note.id)"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    class="size-3"
                                    stroke-width="2"
                                >
                                    <path d="M3 6h18" stroke-linecap="round" />
                                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                    <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                                </svg>
                            </motion.button>
                        </div>
                    </motion.li>
                </AnimatePresence>
            </ul>
            <motion.p
                v-if="filteredNotes.length === 0"
                class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400"
                :initial="{ opacity: 0, y: 4 }"
                :animate="{ opacity: 1, y: 0 }"
            >
                {{ query ? "No notes match your search." : "No saved notes yet. Start typing!" }}
            </motion.p>
        </div>
    </motion.aside>
</template>
