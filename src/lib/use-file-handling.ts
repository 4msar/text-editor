import { type Ref } from "vue";

export const useFileHandling = (value: Ref<string>) => {
    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                value.value = e.target?.result as string;
            };
            reader.readAsText(file);
        }
    };

    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
    };

    const handleFileOpen = (event: Event) => {
        const fileInput = event.target as HTMLInputElement;
        if (fileInput.files && fileInput.files.length > 0) {
            try {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    value.value = e.target?.result as string;
                };
                reader.readAsText(file);
            } catch (error) {
                alert("Error reading file: " + error);
            }
        }
    };

    const attachEventListeners = () => {
        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("dragleave", handleDragLeave);
        document.addEventListener("drop", handleDrop);
    };

    const detachEventListeners = () => {
        document.removeEventListener("dragover", handleDragOver);
        document.removeEventListener("dragleave", handleDragLeave);
        document.removeEventListener("drop", handleDrop);
    };

    return {
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleFileOpen,
        attachEventListeners,
        detachEventListeners,
    };
};
