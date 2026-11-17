<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { motion } from "motion-v";
import Modal from "./ui/Modal.vue";
import { fileNameFromContent, handleDownload } from "../lib/utils";
import { toast } from "../lib/use-toast";
import type { FileMeta } from "../type";

const props = defineProps<{ open: boolean; value: string; file?: FileMeta }>();
const emit = defineEmits<{ (e: "close"): void }>();

type Format = { id: string; label: string; ext: string; mime: string; hint: string };

const splitName = (name: string) => {
    const dot = name.lastIndexOf(".");
    return dot > 0 ? { base: name.slice(0, dot), ext: name.slice(dot + 1) } : { base: name, ext: "" };
};

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formats = computed<Format[]>(() => {
    const list: Format[] = [
        { id: "txt", label: "Plain text", ext: "txt", mime: "text/plain;charset=utf-8", hint: ".txt" },
        { id: "md", label: "Markdown", ext: "md", mime: "text/markdown;charset=utf-8", hint: ".md" },
        { id: "html", label: "HTML", ext: "html", mime: "text/html;charset=utf-8", hint: ".html" },
    ];
    if (props.file) {
        const { ext } = splitName(props.file.name);
        list.unshift({
            id: "original",
            label: "Original format",
            ext,
            mime: props.file.type,
            hint: ext ? `.${ext}` : props.file.name,
        });
    }
    return list;
});

const selected = ref("txt");
const baseName = ref("");

// Reset choices every time the dialog opens, based on the current note.
watch(
    () => props.open,
    (open) => {
        if (!open) return;
        const suggested = props.file?.name ?? fileNameFromContent(props.value);
        const { base, ext } = splitName(suggested);
        baseName.value = base;
        selected.value = props.file ? "original" : ext === "md" ? "md" : "txt";
    },
);

const format = computed(() => formats.value.find((f) => f.id === selected.value) ?? formats.value[0]);
const fileName = computed(() => {
    const base = baseName.value.trim() || "note";
    return format.value.ext ? `${base}.${format.value.ext}` : base;
});

const toHtml = (text: string, title: string) =>
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>body{margin:2rem auto;max-width:48rem;padding:0 1rem;font:16px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}pre{white-space:pre-wrap;word-wrap:break-word}</style>
</head>
<body>
<pre>${escapeHtml(text)}</pre>
</body>
</html>
`;

const submit = () => {
    const f = format.value;
    const content = f.id === "html" ? toHtml(props.value, baseName.value.trim() || "note") : props.value;
    const name = handleDownload(content, fileName.value, f.mime);
    toast.success(`Downloaded ${name}`);
    emit("close");
};

// Up/Down cycle formats from anywhere in the dialog (radios already handle arrows natively).
const moveSelection = (step: number) => {
    const list = formats.value;
    const index = list.findIndex((f) => f.id === selected.value);
    selected.value = list[(index + step + list.length) % list.length].id;
};

const handleKeydown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isRadio = target instanceof HTMLInputElement && target.type === "radio";
    if (event.key === "Enter" && !event.isComposing && target.tagName !== "BUTTON") {
        event.preventDefault();
        submit();
    } else if (!isRadio && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        moveSelection(event.key === "ArrowDown" ? 1 : -1);
    }
};

defineExpose({ submit });
</script>

<template>
    <Modal :open="open" title="Download" @close="$emit('close')">
        <form id="download-form" class="space-y-4 text-sm" @submit.prevent="submit" @keydown="handleKeydown">
            <label class="block space-y-1.5">
                <span class="font-medium">File name</span>
                <div
                    class="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                >
                    <input
                        v-model="baseName"
                        type="text"
                        spellcheck="false"
                        class="min-w-0 flex-1 bg-transparent px-3 py-2 outline-none"
                        placeholder="note"
                    />
                    <span v-if="format.ext" class="pr-3 text-slate-500 dark:text-slate-400">.{{ format.ext }}</span>
                </div>
            </label>

            <fieldset class="space-y-1.5">
                <legend class="mb-1.5 font-medium">Format</legend>
                <label
                    v-for="(f, i) in formats"
                    :key="f.id"
                    class="relative flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 ring-1 transition-colors has-focus-visible:outline-1 has-focus-visible:outline-offset-1 has-focus-visible:outline-blue-500"
                    :class="
                        selected === f.id
                            ? 'bg-blue-50 ring-blue-500 dark:bg-blue-500/10'
                            : 'ring-slate-200 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800/60'
                    "
                >
                    <motion.span
                        class="flex items-center gap-2.5"
                        :initial="{ opacity: 0, x: -6 }"
                        :animate="{ opacity: 1, x: 0 }"
                        :transition="{ delay: 0.03 + i * 0.03 }"
                    >
                        <input
                            v-model="selected"
                            type="radio"
                            name="download-format"
                            :value="f.id"
                            :data-autofocus="selected === f.id || undefined"
                            class="accent-blue-600 outline-none"
                        />
                        <span>{{ f.label }}</span>
                    </motion.span>
                    <span class="truncate text-xs text-slate-500 dark:text-slate-400">{{ f.hint }}</span>
                </label>
            </fieldset>
        </form>

        <template #footer>
            <div class="flex items-center justify-end gap-2">
                <p class="mr-auto hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                    <kbd class="font-sans">↑</kbd><kbd class="font-sans">↓</kbd> format ·
                    <kbd class="font-sans">Enter</kbd> download
                </p>
                <button
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    @click="$emit('close')"
                >
                    Cancel
                </button>
                <motion.button
                    type="submit"
                    form="download-form"
                    :whilePress="{ scale: 0.95 }"
                    class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Download
                </motion.button>
            </div>
        </template>
    </Modal>
</template>
