<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";
import { nextTick, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";

const props = defineProps<{ open: boolean; title: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

watch(
    () => props.open,
    async (open) => {
        if (open) {
            previouslyFocused = document.activeElement as HTMLElement | null;
            await nextTick();
            panel.value?.focus();
        } else {
            previouslyFocused?.focus?.();
        }
    },
);

useEventListener(window, "keydown", (event: KeyboardEvent) => {
    if (props.open && event.key === "Escape") {
        event.preventDefault();
        emit("close");
    }
});
</script>

<template>
    <Teleport to="body">
        <AnimatePresence>
            <motion.div
                v-if="open"
                key="modal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[3px] dark:bg-black/50"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.18 }"
                @click.self="emit('close')"
            >
                <motion.div
                    class="w-full max-w-md"
                    :initial="{ opacity: 0, scale: 0.94, y: 14 }"
                    :animate="{ opacity: 1, scale: 1, y: 0 }"
                    :exit="{ opacity: 0, scale: 0.96, y: 8 }"
                    :transition="{ type: 'spring', stiffness: 420, damping: 32 }"
                >
                    <div
                        ref="panel"
                        role="dialog"
                        aria-modal="true"
                        :aria-label="title"
                        tabindex="-1"
                        class="flex max-h-[85svh] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/5 outline-none dark:bg-slate-900 dark:text-slate-100 dark:ring-white/10"
                    >
                        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
                            <h2 class="text-base font-semibold">{{ title }}</h2>
                            <motion.button
                                type="button"
                                title="Close (Esc)"
                                aria-label="Close"
                                :whileHover="{ rotate: 90, scale: 1.1 }"
                                :whilePress="{ scale: 0.9 }"
                                class="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                @click="emit('close')"
                            >
                                <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </header>
                        <div class="overflow-y-auto px-5 py-4">
                            <slot />
                        </div>
                        <footer v-if="$slots.footer" class="border-t border-slate-200 px-5 py-3 dark:border-slate-800">
                            <slot name="footer" />
                        </footer>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    </Teleport>
</template>
