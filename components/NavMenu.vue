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
            <div class="form_el">
                <label>{{t('password')}}</label>
                <input type="password" v-model="new_pw" />
            </div>
            <div class="form_el">
                <label>{{t('retypePassword')}}</label>
                <input type="password" v-model="retynew_pw" />
            </div>
            <div v-if="new_pw !== retynew_pw" class="field-error">{{ t('passowrdsNoMatch') }}</div>
            <div class="mt-4">
                <button class="custom-button-link" @click="handleChangePassword">Ok</button>
            </div>
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
const config = useRuntimeConfig();

const isLinkShown = computed<boolean>(():boolean => route.path === '/' || route.path === '/profile');
const v_interfaceLang = ref<string>('');

// Change pw
const new_pw = ref<string>('');
const retynew_pw = ref<string>('');
//

const handleLogout = () => {
    store.setUserLangData([]);
    store.setCurrentUserName('');
    store.setCurrentUserId('');
    navigateTo('/');
    useCookie('user').value = '';
    useCookie('token').value = '';
};

const handleChangePassword = async () => {
    if (!new_pw.value || new_pw.value !== retynew_pw.value) {
        return
    }

    store.setLoading(true);
    const changePwRes = await fetch(`${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/change-password`, {
        method: 'POST',
        body: JSON.stringify({
            "userId": store.currentUserId,
            "password": new_pw.value,
        }),
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err signup API:', err);
    })
    .finally(() => {
        store.setLoading(false);
        store.setModalOpen(false);
        store.setModalType('');
        new_pw.value = '';
        retynew_pw.value = '';
    });
}

watch(() => v_interfaceLang.value, (v) => {
    console.log('v_interfaceLang', v);
    setLocale(v);
});

onMounted(() => {
    v_interfaceLang.value = store.userMotherTongue;
    setLocale(store.userMotherTongue);
})

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
        password: 'New password'
        retypePassword: 'Retype new password'
        passowrdsNoMatch: "Passwords don't match"
        logout: 'Logout'
        goToHome: 'Homepage'
        interfaceLang: 'Change interface language (default is your mother tongue specified during registration)'
        languageMenu: 'Language menu'
    ru:
        myProfile: 'Мой профиль'
        changePasword: 'Изменить пароль'
        password: 'Новый пароль'
        retypePassword: 'Повторите новый пароль'
        passowrdsNoMatch: 'Пароли не совпадают'
        logout: 'Выйти'
        goToHome: 'Домашняя страница'
        interfaceLang: 'Сменить язык интерфейса (стандартный - ваш родной язык, указанный при регистрации)'
        languageMenu: 'Языковое меню'
    zh:
        myProfile: '我的履歷'
        changePasword: '更改密碼'
        password: '新密碼'
        retypePassword: '重新輸入新密碼'
        passowrdsNoMatch: '密碼不匹配'
        logout: '登出'
        goToHome: '首頁'
        interfaceLang: '更改介面語言（預設為註冊時指定的母語）'
        languageMenu: '語言選單'
</i18n>
