<template>
    <div class="language-app-site">
        <NavMenu />
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { useMainStore } from 'store/main';
const store = useMainStore();
const route = useRoute()

watch(route, function() {
    // stop lesson if during lesson user navigates anywhere else
    if (store.lessonStarted) {
        store.setLessonStarted(false);
    }
});

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
</style>
