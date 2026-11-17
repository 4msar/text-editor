<script setup lang="ts">
import { computed } from "vue";
import { AnimatePresence, motion } from "motion-v";
import { useDarkMode, type Theme } from "../lib/use-dark-mode";
import { useSettings } from "../lib/use-settings";
import Modal from "./ui/Modal.vue";
import SegmentedControl from "./ui/SegmentedControl.vue";
import { formatDate } from "../lib/utils";
import type { StatusBarItem } from "../type";
import GithubButton from "./GithubButton.vue";

defineProps<{ open: boolean }>();
defineEmits<{ (e: "close"): void }>();

const { theme, setTheme } = useDarkMode();
const settings = useSettings();

const themeModel = computed<Theme>({
    get: () => theme.value,
    set: (value) => setTheme(value),
});

const statusBarItems: { key: StatusBarItem; label: string }[] = [
    { key: "cursor", label: "Line & column" },
    { key: "selection", label: "Selection" },
    { key: "words", label: "Words" },
    { key: "chars", label: "Characters" },
    { key: "lines", label: "Lines" },
    { key: "readTime", label: "Read time" },
    { key: "time", label: "Clock" },
];

const clockPreview = computed(() => formatDate(new Date(), settings.value.clock));

const fontSize = computed({
    get: () => Number(settings.value.fontSize),
    set: (value: number) => {
        settings.value.fontSize = String(Math.min(32, Math.max(12, value)));
    },
});
</script>

<template>
    <Modal :open="open" title="Settings" @close="$emit('close')">
        <div class="space-y-5 text-sm">
            <section class="space-y-2">
                <h3 class="font-medium">Theme</h3>
                <SegmentedControl
                    v-model="themeModel"
                    name="theme"
                    :options="[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'system', label: 'System' },
                    ]"
                />
            </section>

            <section class="space-y-2">
                <h3 class="font-medium">Layout</h3>
                <SegmentedControl
                    v-model="settings.ui"
                    name="layout"
                    :options="[
                        { value: 'auto', label: 'Auto' },
                        { value: 'box', label: 'Box' },
                        { value: 'centered', label: 'Centered' },
                        { value: 'fluid', label: 'Full width' },
                    ]"
                />
            </section>

            <AnimatePresence>
                <motion.section
                    v-if="settings.ui === 'box'"
                    key="logo"
                    class="overflow-hidden"
                    :initial="{ height: 0, opacity: 0 }"
                    :animate="{ height: 'auto', opacity: 1 }"
                    :exit="{ height: 0, opacity: 0 }"
                    :transition="{ duration: 0.2 }"
                >
                    <label class="flex cursor-pointer items-center justify-between gap-4">
                        <span>
                            <span class="block font-medium">Show logo</span>
                            <span class="text-xs text-slate-500 dark:text-slate-400"
                                >Display the logo above the editor box</span
                            >
                        </span>
                        <input v-model="settings.showLogo" type="checkbox" class="peer sr-only" />
                        <span
                            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-blue-500"
                            :class="settings.showLogo ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'"
                        >
                            <motion.span
                                class="size-5 rounded-full bg-white shadow"
                                :animate="{ x: settings.showLogo ? 20 : 0 }"
                                :transition="{ type: 'spring', stiffness: 600, damping: 32 }"
                            />
                        </span>
                    </label>
                </motion.section>
            </AnimatePresence>

            <section class="space-y-2">
                <div class="flex items-center justify-between">
                    <h3 class="font-medium">Font size</h3>
                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            aria-label="Decrease font size"
                            class="size-6 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            @click="fontSize--"
                        >
                            −
                        </button>
                        <motion.span
                            :key="settings.fontSize"
                            class="w-10 text-center text-xs tabular-nums"
                            :initial="{ y: -6, opacity: 0 }"
                            :animate="{ y: 0, opacity: 1 }"
                        >
                            {{ settings.fontSize }}px
                        </motion.span>
                        <button
                            type="button"
                            aria-label="Increase font size"
                            class="size-6 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            @click="fontSize++"
                        >
                            +
                        </button>
                    </div>
                </div>
                <input
                    v-model.number="fontSize"
                    type="range"
                    min="12"
                    max="32"
                    step="1"
                    class="w-full cursor-pointer accent-blue-600"
                />
                <p
                    class="truncate rounded-md bg-slate-100 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    :style="{ fontSize: `${settings.fontSize}px` }"
                >
                    The quick brown fox
                </p>
            </section>

            <section class="space-y-2">
                <h3 class="font-medium">When opening a new tab</h3>
                <SegmentedControl
                    v-model="settings.newNoteBehavior"
                    name="new-note"
                    :options="[
                        { value: 'open-last', label: 'Open last note' },
                        { value: 'start-fresh', label: 'Start fresh' },
                    ]"
                />
            </section>

            <section class="space-y-2">
                <h3 class="font-medium">Status bar</h3>
                <div class="grid grid-cols-2 gap-1.5">
                    <label
                        v-for="item in statusBarItems"
                        :key="item.key"
                        class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <input
                            v-model="settings.statusBar[item.key]"
                            type="checkbox"
                            class="size-3.5 cursor-pointer accent-blue-600"
                        />
                        {{ item.label }}
                    </label>
                </div>
            </section>

            <AnimatePresence>
                <motion.section
                    v-if="settings.statusBar.time"
                    key="clock"
                    class="space-y-2 overflow-hidden"
                    :initial="{ height: 0, opacity: 0 }"
                    :animate="{ height: 'auto', opacity: 1 }"
                    :exit="{ height: 0, opacity: 0 }"
                    :transition="{ duration: 0.2 }"
                >
                    <div class="flex items-center justify-between">
                        <h3 class="font-medium">Time format</h3>
                        <span class="text-xs tabular-nums text-slate-500 dark:text-slate-400">{{ clockPreview }}</span>
                    </div>
                    <SegmentedControl
                        v-model="settings.clock.hourFormat"
                        name="hour-format"
                        :options="[
                            { value: '12h', label: '12-hour' },
                            { value: '24h', label: '24-hour' },
                        ]"
                    />
                    <div class="flex gap-4 px-1 text-xs">
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                v-model="settings.clock.showDate"
                                type="checkbox"
                                class="size-3.5 cursor-pointer accent-blue-600"
                            />
                            Show date
                        </label>
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                v-model="settings.clock.showSeconds"
                                type="checkbox"
                                class="size-3.5 cursor-pointer accent-blue-600"
                            />
                            Show seconds
                        </label>
                    </div>
                </motion.section>
            </AnimatePresence>
        </div>

        <template #footer>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <motion.a
                        href="https://msar.me/contact?open=form"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Contact me"
                        class="hidden size-5 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-300/60 hover:text-slate-900 md:inline-flex dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                        aria-label="Contact me"
                        :whileHover="{ scale: 1.12, rotate: -8 }"
                        :whilePress="{ scale: 0.88 }"
                    >
                        <svg
                            fill="none"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="size-3 stroke-current"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            version="1.1"
                            data-view-component="true"
                        >
                            <path
                                d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
                            />
                            <path d="m21.854 2.147-10.94 10.939" />
                        </svg>
                    </motion.a>
                    <GithubButton />
                </div>

                <motion.button
                    type="button"
                    :whilePress="{ scale: 0.95 }"
                    class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    @click="$emit('close')"
                >
                    Done
                </motion.button>
            </div>
        </template>
    </Modal>
</template>
