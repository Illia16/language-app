<template>
    <div class="main-page">
        <!-- <Auth /> -->
        <ListLanguages v-if="!store.lang" />
        <ListExercises v-if="store.lang" />
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
const store = useMainStore();
const { locale } = useI18n()

useHead({
    title: 'Language App',
    htmlAttrs: {
        lang: locale,
    }
})
</script>


<style lang="scss">
    .main-page {
        @apply flex flex-col items-center space-y-20;

        h1 {
            @apply text-4xl text-center;
        }
    }
</style>

