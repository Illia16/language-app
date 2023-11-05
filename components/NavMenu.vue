<template>
    <nav>
        <ul v-if="!store.lessonStarted" class="main-menu">
            <li v-if="$route.path !== '/'">
                <NuxtLink to="/" class="custom-button-link-secondary">
                    {{t('goToHome')}}
                </NuxtLink>
            </li>
            <li v-if="store.userLangData && store.userLangData.length && $route.path !== '/profile'">
                <NuxtLink class="custom-button-link-secondary" to="/profile">{{t('myProfile')}}</NuxtLink>
            </li>
            <li v-if="isLogoutLinkShown">
                <button @click="store.setUserLangData([]), navigateTo('/')" class="custom-button-link-secondary">
                    {{ t('logout') }}
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
const route = useRoute()
const { t } = useI18n({
  useScope: 'local'
})
const store = useMainStore();

const isLogoutLinkShown = computed<boolean>(():boolean => {
    return store.userLangData && store.userLangData.length > 0 && (route.path === '/' || route.path === '/profile');
})

</script>

<style lang="scss">
    .main-menu {
        @apply flex space-x-4;

        li {
            @apply flex items-center;
        }
    }
</style>


<i18n lang="yaml">
    en:
        myProfile: 'My profile'
        logout: 'Logout'
        goToHome: 'Homepage'
        languageMenu: 'Language menu'
    ru:
        myProfile: 'Мой профиль'
        logout: 'Выйти'
        goToHome: 'Домашняя страница'
        languageMenu: 'Языковое меню'
    zh:
        myProfile: 'TBD'
        logout: 'TBD'
        goToHome: 'TBD'
        languageMenu: '语言菜单'
</i18n>