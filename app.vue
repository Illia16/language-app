<template>
    <div class="language-app-site">
        <NavMenu v-if="!store.lessonStarted" />
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { useMainStore } from 'store/main';
const store = useMainStore();
</script>

<style lang="scss">
    .language-app-site {
        @apply flex flex-col items-center min-h-screen bg-[#ffe6a5] px-5 py-4;

        p {
            &.specialP {
                @apply text-yellow-600;
            }
        }
    }

    .lock-scroll {
        @apply overflow-hidden;
    }
</style>
