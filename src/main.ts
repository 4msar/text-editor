import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { registerSW } from "virtual:pwa-register";

// Register the service worker for PWA functionality
const updateSW = registerSW({
    onNeedRefresh() {
        // Show a message to user to refresh the page
        if (confirm("New content available. Reload?")) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log("App ready to work offline");
    },
});

createApp(App).mount("#app");
