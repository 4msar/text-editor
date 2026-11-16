<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";

defineProps<{ show: boolean }>();
</script>

<template>
    <AnimatePresence>
        <motion.div
            v-if="show"
            key="drop"
            class="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-blue-500/10 p-6 backdrop-blur-[2px]"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.15 }"
        >
            <motion.div
                class="flex size-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-blue-500/70 text-blue-600 dark:text-blue-300"
                :initial="{ scale: 0.96 }"
                :animate="{ scale: 1 }"
                :exit="{ scale: 0.96 }"
                :transition="{ type: 'spring', stiffness: 400, damping: 28 }"
            >
                <motion.svg
                    class="size-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :animate="{ y: [0, -6, 0] }"
                    :transition="{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }"
                >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M12 12v6" />
                    <path d="m15 15-3-3-3 3" />
                </motion.svg>
                <p class="text-sm font-semibold">Drop to open as a new note</p>
            </motion.div>
        </motion.div>
    </AnimatePresence>
</template>
