<template>
    <button type="button" title="Settings"
        class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
        @click="$emit('open-setting')">
        <svg class="size-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor">
            <g>
                <path stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z">
                </path>
                <path stroke-linejoin="round" stroke-width="2"
                    d="M10.47 4.32c.602-1.306 2.458-1.306 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.474.218c1.305.602 1.305 2.458 0 3.06l-.474.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218.473c-.602 1.306-2.458 1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.163-2.163l.181-.489a1.684 1.684 0 0 0-.875-2.112l-.474-.218c-1.305-.602-1.305-2.458 0-3.06l.474-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49c-.498-1.348.814-2.66 2.163-2.163l.489.181a1.684 1.684 0 0 0 2.112-.875l.218-.474Z">
                </path>
            </g>
        </svg>
    </button>
</template>