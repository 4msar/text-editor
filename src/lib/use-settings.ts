import { useStorage } from "@vueuse/core";
import type { Settings } from "../type";

export const defaultSettings: Settings = {
    fontSize: "16",
    ui: "auto",
    showLogo: true,
    newNoteBehavior: "open-last",
    sidebarPinned: false,
    statusBar: {
        cursor: true,
        selection: true,
        words: false,
        chars: false,
        lines: true,
        readTime: false,
        time: true,
    },
    clock: {
        hourFormat: "12h",
        showDate: true,
        showSeconds: false,
    },
};

// Single shared instance so every component reads/writes the same reactive object.
const settings = useStorage<Settings>("settings", defaultSettings, localStorage, {
    // Deep-merge nested groups so newly added keys get defaults for existing users.
    mergeDefaults: (stored, defaults) => ({
        ...defaults,
        ...stored,
        statusBar: { ...defaults.statusBar, ...stored?.statusBar },
        clock: { ...defaults.clock, ...stored?.clock },
    }),
});

export const useSettings = () => settings;
