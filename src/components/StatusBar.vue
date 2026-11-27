<script setup lang="ts">
import { computed } from "vue";
import { AnimatePresence, motion } from "motion-v";
import Time from "./Time.vue";
import ThemeToggle from "./ThemeToggle.vue";
import PWAInstall from "./PWAInstall.vue";
import IconButton from "./ui/IconButton.vue";
import { altKey, modKey } from "../lib/data";
import type { CursorInfo } from "./Editor.vue";
import { useSettings } from "../lib/use-settings";

const settings = useSettings();
const show = computed(() => settings.value.statusBar);

const props = defineProps<{
    value: string;
    fileName?: string;
    cursor: CursorInfo;
    saved: boolean;
    preview: boolean;
}>();

defineEmits<{
    (e: "open-setting"): void;
    (e: "open-help"): void;
    (e: "open-file"): void;
    (e: "download"): void;
    (e: "toggle-preview"): void;
}>();

const stats = computed(() => {
    const words = props.value.trim().split(/\s+/).filter(Boolean).length;
    return {
        chars: props.value.length,
        words,
        lines: props.value.split("\n").length,
        minutes: Math.max(1, Math.round(words / 220)),
    };
});
</script>

<template>
    <div class="absolute bottom-0 left-0 z-20 w-full">
        <div
            class="flex w-full items-center justify-between gap-2 border-t border-slate-300 bg-slate-200/90 px-2 py-1 text-xs text-slate-700 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-300"
        >
            <div class="flex min-w-0 items-center gap-3 tabular-nums">
                <span
                    v-if="fileName"
                    class="hidden max-w-48 truncate rounded bg-blue-500/15 px-1.5 text-blue-700 sm:inline dark:text-blue-300"
                    :title="`Opened from ${fileName}`"
                >
                    {{ fileName }}
                </span>
                <span v-if="show.cursor" class="hidden md:inline">Ln {{ cursor.line }}, Col {{ cursor.column }}</span>
                <span v-if="show.words">{{ stats.words }} words</span>
                <span v-if="show.chars" class="hidden sm:inline">{{ stats.chars }} chars</span>
                <span v-if="show.lines" class="hidden lg:inline">{{ stats.lines }} lines</span>
                <span v-if="show.readTime && stats.words > 50" class="hidden lg:inline"
                    >~{{ stats.minutes }} min read</span
                >
                <AnimatePresence>
                    <motion.span
                        v-if="show.selection && cursor.selected > 0"
                        key="sel"
                        class="hidden rounded bg-blue-500/15 px-1.5 text-blue-700 md:inline dark:text-blue-300"
                        :initial="{ opacity: 0, scale: 0.8 }"
                        :animate="{ opacity: 1, scale: 1 }"
                        :exit="{ opacity: 0, scale: 0.8 }"
                    >
                        {{ cursor.selected }} selected
                    </motion.span>
                </AnimatePresence>
                <AnimatePresence>
                    <motion.span
                        v-if="saved"
                        key="saved"
                        class="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"
                        :initial="{ opacity: 0, x: -4 }"
                        :animate="{ opacity: 1, x: 0 }"
                        :exit="{ opacity: 0 }"
                    >
                        <svg
                            class="size-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <motion.path
                                d="M5 12l5 5L20 7"
                                :initial="{ pathLength: 0 }"
                                :animate="{ pathLength: 1 }"
                                :transition="{ duration: 0.3 }"
                            />
                        </svg>
                        <span class="hidden sm:inline">Saved</span>
                    </motion.span>
                </AnimatePresence>
            </div>

            <div class="flex shrink-0 items-center gap-1.5">
                <IconButton
                    :title="preview ? `Back to editing (${altKey}+P)` : `Preview markdown (${altKey}+P)`"
                    :active="preview"
                    :aria-pressed="preview"
                    @click="$emit('toggle-preview')"
                >
                    <svg
                        class="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <template v-if="preview">
                            <path
                                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                            />
                            <circle cx="12" cy="12" r="3" />
                        </template>
                        <!-- Struck-through eye while editing. -->
                        <template v-else>
                            <path
                                d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                            />
                            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                            <path
                                d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                            />
                            <path d="m2 2 20 20" />
                        </template>
                    </svg>
                </IconButton>
                <PWAInstall />
                <IconButton :title="`Open file (${modKey}+O)`" @click="$emit('open-file')">
                    <svg
                        class="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path
                            d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
                        />
                    </svg>
                </IconButton>
                <AnimatePresence>
                    <motion.div
                        v-if="value"
                        key="dl"
                        :initial="{ opacity: 0, width: 0 }"
                        :animate="{ opacity: 1, width: 'auto' }"
                        :exit="{ opacity: 0, width: 0 }"
                    >
                        <IconButton :title="`Download (${modKey}+S)`" @click="$emit('download')">
                            <svg
                                class="size-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                <path d="M12 18v-6" />
                                <path d="m9 15 3 3 3-3" />
                            </svg>
                        </IconButton>
                    </motion.div>
                </AnimatePresence>
                <IconButton :title="`Shortcuts (${modKey}+/)`" @click="$emit('open-help')">
                    <svg
                        class="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                </IconButton>
                <IconButton
                    :title="`Settings (${modKey}+,)`"
                    class="[&:hover_svg]:rotate-90"
                    @click="$emit('open-setting')"
                >
                    <svg
                        class="size-3 transition-transform duration-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                    >
                        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path
                            d="M10.47 4.32c.602-1.306 2.458-1.306 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.474.218c1.305.602 1.305 2.458 0 3.06l-.474.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218.473c-.602 1.306-2.458 1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.163-2.163l.181-.489a1.684 1.684 0 0 0-.875-2.112l-.474-.218c-1.305-.602-1.305-2.458 0-3.06l.474-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49c-.498-1.348.814-2.66 2.163-2.163l.489.181a1.684 1.684 0 0 0 2.112-.875l.218-.474Z"
                        />
                    </svg>
                </IconButton>
                <ThemeToggle />
                <Time v-if="show.time" class="ml-1 hidden tabular-nums sm:inline" />
            </div>
        </div>
    </div>
</template>
