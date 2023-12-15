<template>
    <nav>
        <ul class="main-menu">
            <li v-if="$route.path !== '/'">
                <NuxtLink to="/" class="custom-button-link-secondary">
                    {{t('goToHome')}}
                </NuxtLink>
            </li>
            <li v-if="$route.path !== '/profile'">
                <NuxtLink class="custom-button-link-secondary" to="/profile">{{t('myProfile')}}</NuxtLink>
            </li>
            <li v-if="isLinkShown">
                <CustomSelect
                    v-model="v_interfaceLang"
                    :options="[
                        {
                            value: 'en',
                            name: 'English'
                        },
                        {
                            value: 'ru',
                            name: 'Русский'
                        },
                        {
                            value: 'zh',
                            name: '简体中文'
                        }
                    ]"
                    state="interfaceLang"
                >
                    <template v-slot:label>{{t('interfaceLang')}}</template>
                </CustomSelect>
            </li>
            <li v-if="isLinkShown">
                <button @click="handleLogout" class="custom-button-link-secondary">
                    {{ t('logout') }}
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
const route = useRoute()
const { t, setLocale } = useI18n({
  useScope: 'local'
})
const store = useMainStore();

const isLinkShown = computed<boolean>(():boolean => route.path === '/' || route.path === '/profile');
const v_interfaceLang = ref<string>('');

const handleLogout = () => {
    store.setUserLangData([]);
    store.setCurrentUserName('');
    navigateTo('/');
    useCookie('user').value = '';
    useCookie('token').value = '';
}

onMounted(() => {
    v_interfaceLang.value = store.userMotherTongue;
    setLocale(store.userMotherTongue);
})

</script>

<style lang="scss">
    .main-menu {
        @apply flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4;

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
        interfaceLang: 'Change interface language (default is your mother tongue specified during registration)'
        languageMenu: 'Language menu'
    ru:
        myProfile: 'Мой профиль'
        logout: 'Выйти'
        goToHome: 'Домашняя страница'
        interfaceLang: 'Сменить язык интерфейса (стандартный - ваш родной язык, указанный при регистрации)'
        languageMenu: 'Языковое меню'
    zh:
        myProfile: 'TBD'
        logout: 'TBD'
        goToHome: 'TBD'
        interfaceLang: 'TBD'
        languageMenu: '语言菜单'
</i18n>
