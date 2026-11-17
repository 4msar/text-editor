<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { formatDate } from '../lib/utils';
import { useSettings } from '../lib/use-settings';

const settings = useSettings();

const time = ref(new Date());
const timer = ref<number | null>(null);

onMounted(() => {
    timer.value = setInterval(() => {
        time.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});

</script>

<template>
    <span>{{ formatDate(time, settings.clock) }}</span>
</template>