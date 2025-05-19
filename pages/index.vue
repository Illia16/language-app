<template>
    <div class="main-page">
        <form id="user_login" v-if="!store.currentUserName">
            <h1>{{t('helloMsg')}}</h1>
            <div class="form_el">
                <label for="username">{{ t('username') }}:</label>
                <input type="text" name="username" v-model="user" />
                <span class="field-error">{{userErrMsg}}</span>
            </div>

            <div class="form_el">
                <label for="password">{{ t('password') }}:</label>
                <input type="password" name="password" v-model="password" />
                <span class="field-error">{{ passwordErrMsg }}</span>
            </div>

            <span v-if="errMsg" class="field-error">{{errMsg}}</span>

            <div class="form-buttons">
                <button type="button" @click="login" class="custom-button-link">
                    {{ t('submit') }}
                </button>
                <div class="form-buttons--sub">
                    <button type="button" @click="store.setModalOpen(true); store.setModalType('forgot-password');" class="custom-button-link-secondary">
                        {{ t('forgotPassword') }}
                    </button>
                    <button type="button" @click="store.setModalOpen(true); store.setModalType('signup');" class="custom-button-link-secondary">
                        {{ t('createAccount') }}
                    </button>
                </div>
            </div>
        </form>
        <!-- User languages in progress -->
        <template v-if="store.currentUserName && store.userRole !== 'delete'">
            <h1>{{ t('languageMenuTitle') }}</h1>
            <ul class="list-items">
                <li v-for="(user_language, i) of userLanguagesInProgress" :key="i">
                    <NuxtLink class="custom-button-link" :to="'/language-' + user_language">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </template>

        <template v-if="store.userRole === 'delete'">
            <h1 v-html="t('accountDeletionTime', {v: accountDeletionTime})"></h1>
        </template>

        <teleport to="body">
            <Modal v-if="store.modalOpen && store.modalType === 'signup'" class="modal-signup">
                <div class="form_el">
                    <label>{{t('username')}}</label>
                    <input type="text" v-model="signup_user" />
                </div>
                <div class="form_el">
                    <label>{{t('specifyYourEmail')}}</label>
                    <input type="text" v-model="signup_user_email" />
                </div>
                <div class="form_el">
                    <label>{{t('password')}}</label>
                    <input type="password" v-model="signup_pw" />
                </div>
                <div class="form_el">
                    <label>{{t('retypePassword')}}</label>
                    <input type="password" v-model="retypeSignup_pw" />
                </div>
                <div v-if="signup_pw !== retypeSignup_pw" class="field-error">{{ t('passowrdsNoMatch') }}</div>
                <CustomSelect
                    v-model="v_motherTongue"
                    :options="[
                        {
                            name: 'English',
                            value: 'en',
                        },
                        {
                            name: 'Chinese',
                            value: 'zh',
                        },
                        {
                            name: 'Russian',
                            value: 'ru',
                        },
                    ]"
                    state="lang"
                >
                    <template v-slot:label>{{t('motherTongue')}}</template>
                </CustomSelect>
                <div class="form_el">
                    <label>{{t('invitationCode')}}</label>
                    <input type="text" v-model="signup_invitation_code" />
                </div>
                <p class="signupEmailNote">{{t('signupEmailNote')}}</p>
                <div class="mt-4">
                    <button class="custom-button-link" @click="signup">{{t('signup')}}</button>
                </div>
            </Modal>
        </teleport>

        <teleport to="body">
            <Modal v-if="store.modalOpen && store.modalType === 'forgot-password'" class="modal-forgot-password">
                <div class="form_el">
                    <label>{{t('specifyYourEmail')}}</label>
                    <input type="text" v-model="userEmail" />
                </div>
                <div class="mt-4">
                    <button class="custom-button-link" @click="handleForgotPassword">Ok</button>
                </div>
            </Modal>
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { mapLanguage } from 'helper/helpers';
import { type UserData } from 'types/helperTypes'

const config = useRuntimeConfig();
const store = useMainStore();
const { locale, t, setLocale } = useI18n();

useHead({
    title: 'Language App',
    htmlAttrs: {
        lang: locale,
    }
})

const cookieUser = useCookie('user', { maxAge: 2160000});
const cookieUserId = useCookie('userId', { maxAge: 2160000});
const cookieToken = useCookie('token', { maxAge: 2160000});
const user = ref<string>('');
const password = ref<string>('');
const userErrMsg = ref<string>('');
const errMsg = ref<string>('');
const passwordErrMsg = ref<string>('');
const accountDeletionTime = ref<number>(0);
const userLanguagesInProgress = computed<string[]>(() => store.userLangData.reduce(function (accumulator:string[], currentValue:UserData) {
    if (!accumulator.includes(currentValue.languageStudying)){
        accumulator.push(currentValue.languageStudying)
    }
    return accumulator
}, []))

// Signup
const signup_user = ref<string>('');
const signup_user_email = ref<string>('');
const signup_pw = ref<string>('');
const retypeSignup_pw = ref<string>('');
const v_motherTongue = ref<string>('en');
const signup_invitation_code = ref<string>('');
//

// Forgot password
const userEmail = ref<string>('');
//

const getUserData = async () => {
    const userData = await fetch(`${config.public.API_URL_DATA}/${config.public.ENV_NAME}/data`, {
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        errMsg.value = err?.message;
    })
    .finally(() => {
        store.setLoading(false);
    })

    if (userData.success) {
        cookieUser.value = store.currentUserName;
        cookieUserId.value = store.currentUserId;
        cookieToken.value = store.token;

        if (userData.data && userData.data.length) {
            store.setUserLangData(userData.data);

            if (!store?.userMotherTongue) {
                store.setUserMortherTongue(userData.data[0].userMotherTongue);
                setLocale(store.userMotherTongue);
            }
        }

        if (!store?.userMotherTongue) {
            const userSavedLang = useCookie('i18n_redirected').value as string;
            store.setUserMortherTongue(userSavedLang);
            setLocale(userSavedLang);
        }
    } else {
        errMsg.value = userData?.message;
        store.setUserLangData([]);
        store.setCurrentUserName('');
        store.setCurrentUserId('');
        useCookie('user').value = '';
        useCookie('token').value = '';
    }
}

const login = async () => {
    document.querySelectorAll('.form_el').forEach(el=>el.classList.remove('error'))

    if (!user.value || !password.value) {
        if (!user.value) {
            userErrMsg.value = t('userNameEmptyErr')
            document.querySelector('.form_el input[name="username"')?.parentElement?.classList.add('error')
        }

        if (!password.value) {
            passwordErrMsg.value = t('passwordNameEmptyErr')
            document.querySelector('.form_el input[name="password"')?.parentElement?.classList.add('error')
        }

        return
    }

    store.setLoading(true);
    const authUser = await fetch(`${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/login`, {
        method: 'POST',
        body: JSON.stringify({user: user.value, password: password.value})
    })
    .then(res => res.json())
    .catch(er => {
        console.log('er', er);
    })

    if (!authUser.success) {
        errMsg.value = authUser?.message;
        store.setLoading(false);
        return
    } else {
        errMsg.value = '';
        cookieUser.value = authUser.data.user;
        cookieUserId.value = authUser.data.userId;
        cookieToken.value = authUser.data.token;
        store.setCurrentUserName(authUser.data.user);
        store.setCurrentUserId(authUser.data.userId);
        store.setToken(authUser.data.token);
        store.setUserMortherTongue(authUser.data.userMotherTongue);
        setLocale(authUser.data.userMotherTongue);

        if (authUser.data.role === 'delete') {
            store.setUserRole(authUser.data.role)
            accountDeletionTime.value = Number(authUser.data.accountDeletionTime)/(1000 * 60 * 60 * 24);
            store.setLoading(false);
        } else {
            store.setUserRole('');
            await getUserData();
        }
    }
}

const signup = async () => {
    if (!signup_user.value || !signup_user_email.value || !signup_pw.value || !signup_invitation_code || signup_pw.value !== retypeSignup_pw.value) {
        return
    }

    store.setLoading(true);
    const signupRes = await fetch(`${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/register`, {
        method: 'POST',
        body: JSON.stringify({
            "user": signup_user.value,
            "userEmail": signup_user_email.value,
            "password": signup_pw.value,
            "userMotherTongue": v_motherTongue.value,
            "invitationCode": signup_invitation_code.value,
        })
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err signup API:', err);
    })
    .finally(() => {
        store.setLoading(false);
        store.setModalOpen(false);
        store.setModalType('');
    });

    if (!signupRes.success) {
        errMsg.value = signupRes.message;
    } else {
        errMsg.value = '';
    }
}

const handleForgotPassword =async () => {
    if (!userEmail.value) {
        return
    }

    store.setLoading(true);
    const signupRes = await fetch(`${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({
            "userEmail": userEmail.value,
        })
    })
    .then(res => res.json())
    .catch(err => {
        console.log('err signup API:', err);
    })
    .finally(() => {
        store.setLoading(false);
        store.setModalOpen(false);
        store.setModalType('');
        userEmail.value = '';
    });

    if (!signupRes.success) {
        errMsg.value = signupRes.message;
    } else {
        errMsg.value = '';
    }
}

onMounted(async() => {
    if (cookieUser.value && cookieUserId.value && cookieToken.value && !store.currentUserName && !store.userLangData.length) {
        store.setCurrentUserName(cookieUser.value);
        store.setCurrentUserId(cookieUserId.value);
        store.setToken(cookieToken.value);
        store.setLoading(true);
        await getUserData();
    }
})
</script>

<style lang="scss">
    .main-page {
        @apply flex flex-col items-center;

        h1 {
            @apply text-4xl my-8;
        }

        h1, h2 {
            @apply text-center;
        }

        h2 {
            @apply mb-4;

            &.tasks {
                @apply mt-24;
            }
        }

        #user_login {
            @apply space-y-3;

            .form-buttons {
                @apply flex flex-col space-y-2;

                .form-buttons--sub {
                    @apply flex justify-center space-x-2;

                    button {
                        @apply text-xs;
                    }
                }
            }
        }
    }

    .modal-signup {
        .signupEmailNote {
            @apply text-xs my-1;
        }
    }
</style>


<i18n lang="yaml">
    en:
        helloMsg: 'Please, sign in to continue'
        submit: 'Sign in'
        signup: 'Signup'
        signupEmailNote: 'You will need to vefiry your email address after registration. Look for an email from Amazon.'
        forgotPassword: 'Forgot password?'
        specifyYourEmail: 'Please, specify your email'
        createAccount: 'Create account'
        accountDeletionTime: Your account will be deleted in {v} days
        username: 'Username'
        password: 'Password'
        retypePassword: 'Retype password'
        motherTongue: 'Select your mother tongue'
        invitationCode: 'Invitation code'
        passowrdsNoMatch: "Passwords don't match"
        userNameEmptyErr: 'Please, enter your username'
        passwordNameEmptyErr: 'Please, enter your password'
        noUserFoundErr: 'No user found'
        languageMenuTitle: "Select the language you're learning"
    ru:
        helloMsg: 'Пожалуйста, введите Ваш логин и пароль'
        submit: 'Войти'
        signup: 'Создать'
        signupEmailNote: 'Вам нужно будет подтвердить вашу электронную почту после регистрации. Смотрите на письмо от Amazon.'
        forgotPassword: 'Забыли пароль?'
        specifyYourEmail: 'Укажите вашу электронную почту'
        createAccount: 'Создать аккаунт'
        accountDeletionTime: Ваш аккаунт будет удален через {v} дней
        username: 'Логин'
        password: 'Пароль'
        retypePassword: 'Повторите пароль'
        motherTongue: 'Выбирите ваш родной язык'
        invitationCode: 'Код приглашения'
        passowrdsNoMatch: 'Пароли не совпадают'
        userNameEmptyErr: 'Пожалуйста, введите ваш логин'
        passwordNameEmptyErr: 'Пожалуйста, введите ваш пароль'
        noUserFoundErr: 'Пользователь не найден'
        languageMenuTitle: 'Выбирите язык который изучаете'
    zh:
        helloMsg: 請登入以繼續
        submit: 登入
        signup: 註冊
        signupEmailNote: 註冊後，您需要驗證您的電子郵件地址。請查看來自亞馬遜的郵件。
        forgotPassword: 忘記密碼？
        specifyYourEmail: 請指定您的電子郵件
        createAccount: 創建帳戶
        accountDeletionTime: 你的帐户将在 {v} 天内被删除
        username: 用戶名
        password: 密碼
        retypePassword: 重新輸入密碼
        motherTongue: 選擇您的母語
        invitationCode: 邀請碼
        passowrdsNoMatch: 密碼不匹配
        userNameEmptyErr: 請輸入您的用戶名
        passwordNameEmptyErr: 請輸入您的密碼
        noUserFoundErr: 未找到使用者
        languageMenuTitle: 選擇您正在學習的語言
</i18n>
