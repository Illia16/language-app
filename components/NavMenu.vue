<template>
    <nav>
        <ul class="main-menu">
            <li v-if="isLinkShown">
                Hello, {{ store.currentUserName }}!
            </li>
            <template v-if="store.userRole !== 'delete'">
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
                <li v-if="$route.path === '/profile'">
                    <button @click="store.setModalOpen(true); store.setModalType('delete-account');" class="custom-button-link-secondary">
                        {{ t('deleteAccount') }}
                    </button>
                </li>
            </template>
            <template v-if="store.userRole === 'delete'">
                <button @click="store.setModalOpen(true); store.setModalType('restore-account');" class="custom-button-link-secondary">
                    {{ t('restoreAccount') }}
                </button>
            </template>
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
        <Modal v-if="store.modalOpen && store.modalType === 'delete-account'" @closeCallback="closeModal" class="modal-delete-account">
            <div class="flex flex-col items-center gap-4">
                <div>{{t('areYouSure')}}</div>
                <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <button class="custom-button-link" @click="deleteUser(true)">{{t('confirm')}}</button>
                    <button @click="closeModal" class="custom-button-link">{{t('cancel')}}</button>
                </div>
            </div>
        </Modal>
        <Modal v-if="store.modalOpen && store.modalType === 'restore-account'" @closeCallback="closeModal" class="modal-restore-account">
            <div class="flex flex-col items-center gap-4">
                <div>{{t('areYouSure')}}</div>
                <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <button class="custom-button-link" @click="deleteUser(false)">{{t('confirm')}}</button>
                    <button @click="closeModal" class="custom-button-link">{{t('cancel')}}</button>
                </div>
            </div>
        </Modal>
    </teleport>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';

const config = useRuntimeConfig();
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
    store.setUserRole('');
    navigateTo('/');
    useCookie('languageapp_user').value = '';
    useCookie('languageapp_token').value = '';
};


const closeModal = (): void => {
    store.setModalOpen(false);
    store.setModalType('');
}

watch(() => v_interfaceLang.value, (v) => {
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


// DELETE ACCOUNT API
const deleteUser = async (toBeDeleted: boolean) => {
    store.setLoading(true);
    await fetch(`${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/delete-account`, {
        method: 'POST',
        body: JSON.stringify({
            "user": store.currentUserName,
            "userId": store.currentUserId,
            "toBeDeleted": toBeDeleted
        }),
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err DELETE ACCOUNT API:', err);
    })
    .finally(() => {
        handleLogout();
        closeModal();
        store.setLoading(false);
    });
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
        deleteAccount: 'Delete account'
        areYouSure: 'Are you sure?'
        restoreAccount: 'Restore account'
        logout: 'Logout'
        goToHome: 'Homepage'
        interfaceLang: 'Change interface language (default is your mother tongue specified during registration)'
        languageMenu: 'Language menu'
        confirm: 'Confirm'
        cancel: 'Cancel'
    ru:
        myProfile: 'Мой профиль'
        changePasword: 'Изменить пароль'
        deleteAccount: 'Удалить аккаунт'
        areYouSure: 'Вы уверены?'
        restoreAccount: 'Восстановить аккаунт'
        logout: 'Выйти'
        goToHome: 'Домашняя страница'
        interfaceLang: 'Сменить язык интерфейса (стандартный - ваш родной язык, указанный при регистрации)'
        languageMenu: 'Языковое меню'
        confirm: 'Подтвердить'
        cancel: 'Отменить'
    zh:
        myProfile: '我的履歷'
        changePasword: '更改密碼'
        deleteAccount: '删除帐户'
        areYouSure: '你确定吗？'
        restoreAccount: '恢复帐户'
        logout: '登出'
        goToHome: '首頁'
        interfaceLang: '更改介面語言（預設為註冊時指定的母語）'
        languageMenu: '語言選單'
        confirm: '確認'
        cancel: '取消'
</i18n>
