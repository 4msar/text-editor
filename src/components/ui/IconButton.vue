<script setup lang="ts">
import { motion } from "motion-v";

defineProps<{ title: string; active?: boolean }>();
</script>

<template>
    <motion.button
        type="button"
        :title="title"
        :aria-label="title"
        :whileHover="{ scale: 1.12 }"
        :whilePress="{ scale: 0.88 }"
        :transition="{ type: 'spring', stiffness: 500, damping: 25 }"
        class="inline-flex size-5 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
        :class="
            active
                ? 'bg-slate-300/80 text-slate-900 dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:bg-slate-300/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
        "
    >
        <slot />
    </motion.button>
</template>
