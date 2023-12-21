<template>
    <div class="language-app-site">
        <NavMenu v-if="store.currentUserName && store.userMotherTongue && !store.lessonStarted"/>
        <NuxtPage />
        <Loading v-if="store.loading" />
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
    body {
        @apply font-main;

        h1, h2, h3, h4 {
            @apply font-heading;
        }
    }

    .language-app-site {
        @apply flex flex-col items-center justify-center min-h-screen px-5 py-4 bg-mainBg;

        p {
            &.specialP {
                @apply text-yellow-600;
            }
        }
    }
</style>
