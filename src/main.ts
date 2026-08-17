import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { registerSW } from "virtual:pwa-register";

const SW_REFRESH_LOCK_KEY = "text-editor-sw-refresh-lock";
const SW_REFRESH_LOCK_TTL = 15000;

const claimRefreshLock = () => {
    const now = Date.now();
    const lastRefresh = Number(localStorage.getItem(SW_REFRESH_LOCK_KEY) ?? "0");
    if (now - lastRefresh < SW_REFRESH_LOCK_TTL) {
        return false;
    }
    localStorage.setItem(SW_REFRESH_LOCK_KEY, String(now));
    return true;
};

// Register the service worker for PWA functionality
const updateSW = registerSW({
    onNeedRefresh() {
        if (document.visibilityState !== "visible" || !claimRefreshLock()) {
            return;
        }
        // Show a message to user to refresh the page
        if (confirm("New content available. Reload?")) {
            updateSW(true);
            return;
        }
        localStorage.removeItem(SW_REFRESH_LOCK_KEY);
    },
    onOfflineReady() {
        console.log("App ready to work offline");
    },
});

createApp(App).mount("#app");
