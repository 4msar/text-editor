import { ref } from "vue";

export type ToastKind = "info" | "success" | "error";

export type Toast = {
    id: number;
    message: string;
    kind: ToastKind;
    action?: { label: string; run: () => void };
};

const toasts = ref<Toast[]>([]);
let nextId = 1;

const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
};

type ToastOptions = { kind?: ToastKind; action?: Toast["action"]; duration?: number };

const push = (message: string, options: ToastOptions = {}) => {
    const id = nextId++;
    toasts.value = [...toasts.value, { id, message, kind: options.kind ?? "info", action: options.action }].slice(-4);
    window.setTimeout(() => dismiss(id), options.duration ?? (options.action ? 6000 : 2500));
    return id;
};

export const toast = Object.assign(push, {
    success: (message: string, options?: Omit<ToastOptions, "kind">) => push(message, { ...options, kind: "success" }),
    error: (message: string, options?: Omit<ToastOptions, "kind">) =>
        push(message, { ...options, kind: "error", duration: options?.duration ?? 4000 }),
    dismiss,
});

export const useToasts = () => ({ toasts, dismiss });
