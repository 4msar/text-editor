import { ref } from "vue";
import { toast } from "./use-toast";
import type { FileMeta } from "../type";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export const useFileHandling = (onLoad: (content: string, file: FileMeta) => void) => {
    const isDragging = ref(false);
    let dragDepth = 0;

    const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");

    const readFile = (file: File) => {
        if (file.size > MAX_FILE_BYTES) {
            toast.error(`"${file.name}" is too large (max 4 MB).`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content !== "string") return;
            if (content.includes("\u0000")) {
                toast.error(`"${file.name}" doesn't look like a text file.`);
                return;
            }
            onLoad(content, { name: file.name, type: file.type, lastModified: file.lastModified });
            toast.success(`Opened ${file.name}`);
        };
        reader.onerror = () => toast.error(`Couldn't read "${file.name}".`);
        reader.readAsText(file);
    };

    const handleDragEnter = (event: DragEvent) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        dragDepth += 1;
        isDragging.value = true;
    };

    const handleDragOver = (event: DragEvent) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };

    const handleDragLeave = (event: DragEvent) => {
        if (!hasFiles(event)) return;
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) isDragging.value = false;
    };

    const handleDrop = (event: DragEvent) => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        dragDepth = 0;
        isDragging.value = false;
        const file = event.dataTransfer?.files[0];
        if (file) readFile(file);
    };

    const handleFileOpen = (event: Event) => {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];
        if (file) readFile(file);
        // Allow re-opening the same file later.
        fileInput.value = "";
    };

    const attachEventListeners = () => {
        document.addEventListener("dragenter", handleDragEnter);
        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("dragleave", handleDragLeave);
        document.addEventListener("drop", handleDrop);
    };

    const detachEventListeners = () => {
        document.removeEventListener("dragenter", handleDragEnter);
        document.removeEventListener("dragover", handleDragOver);
        document.removeEventListener("dragleave", handleDragLeave);
        document.removeEventListener("drop", handleDrop);
    };

    return { isDragging, handleFileOpen, attachEventListeners, detachEventListeners };
};
