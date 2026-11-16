<script setup lang="ts" generic="T extends string">
import { motion } from "motion-v";

const model = defineModel<T>({ required: true });
defineProps<{ name: string; options: { value: T; label: string }[] }>();
</script>

<template>
    <div role="radiogroup" :aria-label="name" class="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="model === option.value"
            class="relative rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
            :class="
                model === option.value
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            "
            @click="model = option.value"
        >
            <motion.span
                v-if="model === option.value"
                :layoutId="`${name}-pill`"
                class="absolute inset-0 rounded-md bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-700 dark:ring-white/10"
                :transition="{ type: 'spring', stiffness: 500, damping: 35 }"
            />
            <span class="relative">{{ option.label }}</span>
        </button>
    </div>
</template>
