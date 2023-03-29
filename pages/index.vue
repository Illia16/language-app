<template>
    <div class="main-page">
        <div v-if="!store.lang" id="user_language">
            <h1>{{ t('welcomeMessage') }}</h1>
            <ul>
                <li v-for="(user_language, i) of ['en', 'ru', 'zh']" :key="i" class="user_language">
                    <NuxtLink :to="switchLocalePath(user_language)" @click="store.setLang(user_language)">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </div>

        <template v-if="store.lang">
            <h1>{{ t('selectTask') }}</h1>
            <NuxtLink :to="localePath({ name: 'tenses' })" class="custom-button-link">{{ t('tenses') }}</NuxtLink>
            <NuxtLink :to="localePath({ name: 'words' })" class="custom-button-link">{{ t('words') }}</NuxtLink>
            <button @click="store.setLang('')">Back to language menu</button>
        </template>
    </div>
</template>

<script setup>
import { useMainStore } from '@/store/main';
import { mapLanguage } from '@/helper/helpers';
const store = useMainStore();
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()


useHead({
    title: 'Language App',
    lang: locale,
    htmlAttrs: {
        lang: locale,
    }
})
</script>


<style lang="scss">
    .main-page {
        @apply flex flex-col items-center space-y-5;

        h1 {
            @apply text-4xl mb-5;
        }
    }
</style>

