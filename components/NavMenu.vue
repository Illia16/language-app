<template>
    <nav>
        <ul class="main-menu">
            <li v-if="isLinkShown">
                Hello, {{ store.currentUserName }}!
            </li>
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
            <li v-if="$route.path === '/profile'">
                <button @click="store.setModalOpen(true); store.setModalType('change-pasword');" class="custom-button-link-secondary">
                    {{ t('changePasword') }}
                </button>
            </li>
            <li v-if="isLinkShown">
                <button @click="handleLogout" class="custom-button-link-secondary">
                    {{ t('logout') }}
                </button>
            </li>
        </ul>
    </nav>

    <teleport to="body">
        <Modal v-if="store.modalOpen && store.modalType === 'change-pasword'" class="modal-change-pasword">
            <ChangePassword @pwChangedSuccess="pwChangedSuccessCallback" />
        </Modal>
    </teleport>
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
    store.setCurrentUserId('');
    navigateTo('/');
    useCookie('user').value = '';
    useCookie('token').value = '';
};

watch(() => v_interfaceLang.value, (v) => {
    console.log('v_interfaceLang', v);
    setLocale(v);
});

onMounted(() => {
    v_interfaceLang.value = store.userMotherTongue;
    setLocale(store.userMotherTongue);
})

const pwChangedSuccessCallback = () => {
    store.setModalOpen(false);
    store.setModalType('');
}

</script>

<style lang="scss">
    .main-menu {
        @apply flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4;

        li {
            @apply flex items-center;
        }
    }
</style>


<i18n lang="yaml">
    en:
        myProfile: 'My profile'
        changePasword: 'Change password'
        logout: 'Logout'
        goToHome: 'Homepage'
        interfaceLang: 'Change interface language (default is your mother tongue specified during registration)'
        languageMenu: 'Language menu'
    ru:
        myProfile: 'Мой профиль'
        changePasword: 'Изменить пароль'
        logout: 'Выйти'
        goToHome: 'Домашняя страница'
        interfaceLang: 'Сменить язык интерфейса (стандартный - ваш родной язык, указанный при регистрации)'
        languageMenu: 'Языковое меню'
    zh:
        myProfile: '我的履歷'
        changePasword: '更改密碼'
        logout: '登出'
        goToHome: '首頁'
        interfaceLang: '更改介面語言（預設為註冊時指定的母語）'
        languageMenu: '語言選單'
</i18n>
