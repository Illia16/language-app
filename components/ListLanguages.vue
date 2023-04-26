<template>
    <h1>{{ t('welcomeMessage') }}</h1>
    <ul class="list-items">
        <li v-for="(user_language, i) of ['en', 'ru', 'zh']" :key="i">
            <NuxtLink class="custom-button-link" :to="switchLocalePath(user_language)" @click="store.setLang(user_language)">{{mapLanguage(user_language)}}</NuxtLink>
        </li>
    </ul>
</template>


<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { mapLanguage } from 'helper/helpers';
const store = useMainStore();
const { t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>