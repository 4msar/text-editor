<script setup lang="ts">
import { motion } from "motion-v";
import { shortcuts, type ShortcutInfo } from "../lib/data";
import Modal from "./ui/Modal.vue";

defineProps<{ open: boolean }>();
defineEmits<{ (e: "close"): void }>();

const groups = (["General", "Notes", "Formatting"] as ShortcutInfo["group"][]).map((group) => ({
    group,
    items: shortcuts.filter((s) => s.group === group),
}));
</script>

<template>
    <Modal :open="open" title="Keyboard shortcuts" @close="$emit('close')">
        <div class="space-y-5">
            <section v-for="(g, gi) in groups" :key="g.group">
                <h3 class="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                    {{ g.group }}
                </h3>
                <ul class="space-y-1">
                    <motion.li
                        v-for="(s, i) in g.items"
                        :key="s.label"
                        class="flex items-center justify-between gap-4 rounded-md px-2 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        :initial="{ opacity: 0, x: -8 }"
                        :animate="{ opacity: 1, x: 0 }"
                        :transition="{ delay: 0.04 + (gi * 5 + i) * 0.02 }"
                    >
                        <span>{{ s.label }}</span>
                        <span class="flex gap-1">
                            <kbd
                                v-for="k in s.keys"
                                :key="k"
                                class="min-w-6 rounded border border-b-2 border-slate-300 bg-slate-50 px-1.5 py-0.5 text-center text-[11px] text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            >
                                {{ k }}
                            </kbd>
                        </span>
                    </motion.li>
                </ul>
            </section>
            <p class="text-xs text-slate-500 dark:text-slate-400">
                Notes are saved automatically in your browser. Lists (<code>-</code>, <code>1.</code>, <code>- [ ]</code>) continue on
                Enter. This app can be installed as a PWA and works offline.
            </p>
        </div>
    </Modal>
</template>
