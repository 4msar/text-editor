import { useStorage } from "@vueuse/core";
import type { Settings } from "../type";

export const defaultSettings: Settings = {
    fontSize: "16",
    ui: "auto",
    showLogo: true,
    newNoteBehavior: "open-last",
    sidebarPinned: false,
};

// Single shared instance so every component reads/writes the same reactive object.
const settings = useStorage<Settings>("settings", defaultSettings, localStorage, {
    mergeDefaults: true,
});

export const useSettings = () => settings;
