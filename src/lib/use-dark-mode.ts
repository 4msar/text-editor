import { nextTick, ref } from "vue";

export type Theme = "dark" | "light" | "system";

const STORAGE_KEY = "theme-preference";

const readStoredTheme = (): Theme => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light" || stored === "system") {
            return stored;
        }
    } catch {
        // storage unavailable
    }
    return "system";
};

// Shared state: every caller sees the same theme, so the status-bar toggle and
// the settings dialog never drift apart.
const theme = ref<Theme>(readStoredTheme());
const isDark = ref(false);
let initialized = false;

const mediaQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const resolveDark = () => (theme.value === "system" ? mediaQuery().matches : theme.value === "dark");

// Last pointer position, used as the origin of the theme reveal animation.
let lastPointer: { x: number; y: number; at: number } | null = null;

const applyTheme = () => {
    const dark = resolveDark();
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    isDark.value = dark;
};

const init = () => {
    if (initialized) return;
    initialized = true;
    applyTheme();
    window.addEventListener(
        "pointerdown",
        (e) => {
            lastPointer = { x: e.clientX, y: e.clientY, at: Date.now() };
        },
        { capture: true, passive: true },
    );
    mediaQuery().addEventListener("change", () => {
        if (theme.value === "system") animateThemeChange();
    });
};

const setTheme = (next: Theme) => {
    theme.value = next;
    try {
        localStorage.setItem(STORAGE_KEY, next);
    } catch {
        // ignore
    }
    animateThemeChange();
};

/** Swap the theme with a circular reveal growing from the last click (View Transitions API). */
const animateThemeChange = () => {
    const willBeDark = resolveDark();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (willBeDark === isDark.value || reduceMotion) {
        applyTheme();
        return;
    }

    // Fallback for browsers without View Transitions: a short colour cross-fade.
    if (typeof document.startViewTransition !== "function") {
        const root = document.documentElement;
        root.classList.add("theme-fade");
        applyTheme();
        window.setTimeout(() => root.classList.remove("theme-fade"), 350);
        return;
    }

    const recent = lastPointer && Date.now() - lastPointer.at < 1000;
    const x = recent ? lastPointer!.x : window.innerWidth / 2;
    const y = recent ? lastPointer!.y : window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(async () => {
        applyTheme();
        await nextTick();
    });
    transition.ready
        .then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 550, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
            );
        })
        .catch(() => {});
};

const toggleTheme = () => setTheme(isDark.value ? "light" : "dark");

/**
 * Composable for handling dark mode detection and switching (shared singleton).
 */
export function useDarkMode() {
    init();
    return { isDark, theme, toggleTheme, setTheme, initializeTheme: applyTheme };
}
