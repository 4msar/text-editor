import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "icon.svg",
                "dark.png",
                "light.png",
                "browserconfig.xml",
            ],
            manifest: {
                name: "Editor - Simple Web Text Editor",
                short_name: "Editor",
                description: "A simple text editor to edit quickly on the web",
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
                scope: "/",
                start_url: "/",
                id: "/",
                orientation: "any",
                icons: [
                    {
                        src: "icon.svg",
                        sizes: "any",
                        type: "image/svg+xml",
                        purpose: "any",
                    },
                    {
                        src: "icon.svg",
                        sizes: "192x192",
                        type: "image/svg+xml",
                        purpose: "maskable",
                    },
                    {
                        src: "icon.svg",
                        sizes: "512x512",
                        type: "image/svg+xml",
                        purpose: "any maskable",
                    },
                ],
                categories: ["productivity", "utilities"],
                lang: "en",
                dir: "ltr",
                display_override: ["window-controls-overlay", "standalone"],
                screenshots: [
                    {
                        src: "light.png",
                        sizes: "2047x1386",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Light theme",
                    },
                    {
                        src: "dark.png",
                        sizes: "2047x1386",
                        type: "image/png",
                        form_factor: "wide",
                        label: "Dark theme",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
});
