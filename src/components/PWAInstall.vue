<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

const deferredPrompt = ref<Event | null>(null);
const isInstallable = ref(false);
const isInstalled = ref(false);

// Check if app is already installed
const checkIfInstalled = () => {
    // Check if running in standalone mode (PWA is installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled.value = true;
        return;
    }
    
    // Check for Safari standalone mode
    if ((window.navigator as any).standalone === true) {
        isInstalled.value = true;
        return;
    }
    
    // Check if document.referrer contains android-app
    if (document.referrer.includes('android-app://')) {
        isInstalled.value = true;
        return;
    }
};

const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt.value = e;
    isInstallable.value = true;
};

const handleAppInstalled = () => {
    isInstalled.value = true;
    isInstallable.value = false;
    deferredPrompt.value = null;
};

onMounted(() => {
    checkIfInstalled();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
});

onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
});

const installPWA = async () => {
    if (deferredPrompt.value) {
        (deferredPrompt.value as any).prompt();
        const { outcome } = await (deferredPrompt.value as any).userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt.value = null;
        isInstallable.value = false;
    }
};
</script>

<template>
    <button v-if="isInstallable && !isInstalled" @click="installPWA"
        class="hidden md:block p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors" title="Install App"
        aria-label="Install PWA">

        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" viewBox="0 0 24 24">
            <path fill="currentColor"
                d="M8 21v-2H2V3h10v2H4v12h16v-3h2v5h-6v2H8Zm9-7l-5-5l1.4-1.4l2.6 2.575V3h2v7.175L20.6 7.6L22 9l-5 5Z" />
        </svg>
    </button>

    <!-- Show installed indicator when PWA is installed -->
    <div v-else-if="isInstalled" class="hidden md:block p-1 rounded text-green-600 dark:text-green-400" title="App Installed"
        aria-label="PWA is installed">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="size-3">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
</template>
