<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";
import { useToasts } from "../../lib/use-toast";

const { toasts, dismiss } = useToasts();

const dotClass = {
    info: "bg-blue-500",
    success: "bg-emerald-500",
    error: "bg-rose-500",
} as const;
</script>

<template>
    <div
        aria-live="polite"
        class="pointer-events-none fixed inset-x-0 bottom-10 z-[60] flex flex-col items-center gap-2 px-4"
    >
        <AnimatePresence>
            <motion.div
                v-for="t in toasts"
                :key="t.id"
                layout
                :initial="{ opacity: 0, y: 20, scale: 0.95 }"
                :animate="{ opacity: 1, y: 0, scale: 1 }"
                :exit="{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }"
                :transition="{ type: 'spring', stiffness: 450, damping: 32 }"
                class="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 py-2 pr-2 pl-3 text-xs text-white shadow-lg ring-1 ring-white/10 dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-900/10"
                role="status"
            >
                <span class="size-1.5 shrink-0 rounded-full" :class="dotClass[t.kind]" />
                <span class="flex-1">{{ t.message }}</span>
                <button
                    v-if="t.action"
                    type="button"
                    class="rounded-md bg-white/10 px-2 py-1 font-semibold transition-colors hover:bg-white/20 dark:bg-slate-900/10 dark:hover:bg-slate-900/20"
                    @click="t.action.run(); dismiss(t.id)"
                >
                    {{ t.action.label }}
                </button>
                <button
                    v-else
                    type="button"
                    aria-label="Dismiss"
                    class="rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
                    @click="dismiss(t.id)"
                >
                    <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </AnimatePresence>
    </div>
</template>
