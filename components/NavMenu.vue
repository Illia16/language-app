<template>
    <ul class="main-menu">
        <li v-if="$route.path !== '/'">
            <NuxtLink :to="localePath('/')">
                <span class="sr-only">{{t('goToHome')}}</span>
                <img src="../assets/images/lesson-icon.svg" width="40" height="25" alt="" />
            </NuxtLink>
        </li>
        <li v-if="store.lang">
            <button @click="store.setLang(''), navigateTo('/')" :aria-label="t('languageMenu')">
                <img src="../assets/images/english-icon.svg" width="40" height="25" alt="" />
            </button>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
const localePath = useLocalePath()
const { t } = useI18n({
  useScope: 'local'
})
const store = useMainStore();

</script>

<style lang="scss">
    .main-menu {
        @apply flex space-x-12;

        li {
            @apply flex items-center;
        }
    }
</style>


<i18n lang="yaml">
    en:
        goToHome: 'To all lessons'
        languageMenu: 'Language menu'
    ru:
        goToHome: 'Все уроки'
        languageMenu: 'Языковое меню'
    zh:
        goToHome: '返回首页'
        languageMenu: '语言菜单'
</i18n>