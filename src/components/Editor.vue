<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { AnimatePresence, motion, useAnimate } from "motion-v";
import { handleEditorKeydown } from "../lib/editor-commands";
import { useSettings } from "../lib/use-settings";
import { placeholderTexts } from "../lib/data";
import Logo from "./Logo.vue";

export type CursorInfo = { line: number; column: number; selected: number };

const props = defineProps<{ switchKey: number }>();

const emit = defineEmits<{
    (e: "onFocus"): void;
    (e: "cursor", value: CursorInfo): void;
}>();

const value = defineModel<string>({ default: "", required: true });

const inputRef = ref<HTMLTextAreaElement | null>(null);
const settings = useSettings();
const [scope, animate] = useAnimate();

const isBox = computed(() => settings.value.ui === "box");
const isCentered = computed(() => settings.value.ui === "centered");

// Centered layout keeps the textarea full-width (scrollbar stays at the window edge) and pads the text into a
// readable column. Sized in `ch` so the column follows the font size.
const editorStyle = computed(() => ({
    fontSize: `${settings.value.fontSize}px`,
    tabSize: 4,
    ...(isCentered.value && { paddingInline: "max(1rem, calc((100% - 80ch) / 2))", paddingTop: "3rem" }),
}));

const emitCursor = () => {
    const el = inputRef.value;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const line = before.split("\n").length;
    const column = el.selectionStart - before.lastIndexOf("\n");
    emit("cursor", { line, column, selected: Math.abs(el.selectionEnd - el.selectionStart) });
};

// Subtle cross-fade when switching between notes.
watch(
    () => props.switchKey,
    () => {
        if (!scope.value) return;
        animate(scope.value, { opacity: [0.35, 1], y: [6, 0] }, { duration: 0.25, ease: "easeOut" });
        inputRef.value?.setSelectionRange(0, 0);
        inputRef.value?.scrollTo({ top: 0 });
        emitCursor();
    },
    { flush: "post" },
);

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<template>
    <AnimatePresence>
        <motion.div
            v-if="isBox && settings.showLogo"
            key="logo"
            :initial="{ opacity: 0, y: -12, scale: 0.8 }"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :exit="{ opacity: 0, y: -12, scale: 0.8 }"
            :whileHover="{ rotate: -8, scale: 1.05 }"
            :transition="{ type: 'spring', stiffness: 300, damping: 20 }"
        >
            <Logo class="m-2 size-12 text-black md:m-4 md:size-16 dark:text-white" />
        </motion.div>
    </AnimatePresence>
    <motion.div
        :key="settings.ui"
        :class="
            isBox
                ? 'aspect-16/9 h-full min-h-1/2 w-full overflow-hidden rounded-xl border border-slate-300 shadow-xl ring-1 shadow-slate-900/5 ring-slate-900/5 md:mx-auto md:h-2/3 md:w-2/3 dark:border-slate-700 dark:shadow-black/40 dark:ring-white/5'
                : 'size-full'
        "
        :initial="{ opacity: 0, scale: isBox ? 0.97 : 1, y: isBox ? 12 : 0 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :transition="{ type: 'spring', stiffness: 260, damping: 28 }"
    >
        <div ref="scope" class="size-full">
            <textarea
                id="editor"
                ref="inputRef"
                v-model="value"
                autofocus
                spellcheck="true"
                aria-label="Editor"
                class="editor bg-editor size-full resize-none p-4 pb-9 font-mono text-base text-black caret-blue-600 outline-none selection:bg-blue-500/25 placeholder:text-slate-400 dark:text-white dark:caret-blue-400 dark:placeholder:text-slate-600"
                :placeholder="placeholderTexts.join('\n')"
                :style="editorStyle"
                @keydown="handleEditorKeydown"
                @focus="emit('onFocus')"
                @keyup="emitCursor"
                @click="emitCursor"
                @select="emitCursor"
                @input="emitCursor"
            />
        </div>
    </motion.div>
</template>
