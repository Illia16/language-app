<template>
    <div class="main-page">
        <template v-if="!store.lang">
            <h1>{{ t('welcomeMessage') }}</h1>
            <ul class="list-items">
                <li v-for="(user_language, i) of ['en', 'ru', 'zh']" :key="i">
                    <NuxtLink class="custom-button-link" :to="switchLocalePath(user_language)" @click="store.setLang(user_language)">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </template>

        <template v-if="store.lang">
            <h1>{{ t('selectTask') }}</h1>
            <ul class="list-items">
                <li>
                    <NuxtLink :to="localePath({ name: 'tenses' })" class="custom-button-link">{{ t('tenses') }}</NuxtLink>
                </li>
                <li>
                    <NuxtLink :to="localePath({ name: 'words' })" class="custom-button-link">{{ t('words') }}</NuxtLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { mapLanguage } from 'helper/helpers';
const store = useMainStore();
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

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

