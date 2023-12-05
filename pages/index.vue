<template>
    <div class="main-page">    
        <form id="user_login" v-if="!store.userLangData.length">
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
            <button type="button" @click="login" class="custom-button-link">
                {{ t('submit') }}
            </button>
        </form>

        <!-- User languages in progress -->
        <template v-if="store.userLangData.length">
            <h1>{{ t('languageMenuTitle') }}</h1>
            <ul class="list-items">
                <li v-for="(user_language, i) of userLanguagesInProgress" :key="i">
                    <NuxtLink class="custom-button-link" :to="'/language-' + user_language">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { mapLanguage } from 'helper/helpers';
import { UserData } from 'types/helperTypes'

const config = useRuntimeConfig();
const store = useMainStore();
const { locale, t, setLocale } = useI18n();

useHead({
    title: 'Language App',
    htmlAttrs: {
        lang: locale,
    }
})

const cookieUser = useCookie('user');
const cookieToken = useCookie('token');
const user = ref<string>('');
const password = ref<string>('');
const userErrMsg = ref<string>('');
const errMsg = ref<string>('');
const passwordErrMsg = ref<string>('');
const userLanguagesInProgress = computed<string[]>(() => store.userLangData.reduce(function (accumulator:string[], currentValue:UserData) {
    if (!accumulator.includes(currentValue.languageStudying)){
        accumulator.push(currentValue.languageStudying)
    }
    return accumulator
}, []))

const updateStore = async (user: string, token: string) => {
    store.setCurrentUserName(user);
    store.setToken(token)
}

const getUserData = async () => {
    const userData = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items`, {
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .catch(err => {
        errMsg.value = err?.message;
    })

    console.log('!!!!res!!!!', userData);
    if (userData.success && userData.data && userData.data.length) {
        store.setUserLangData(userData.data);
        const userMortherTongue = store.userLangData[0].languageMortherTongue;
        setLocale(userMortherTongue);
        cookieUser.value = store.currentUserName;
        cookieToken.value = store.token;
    } else {
        errMsg.value = userData?.message;
        // userErrMsg.value = t('noUserFoundErr')
        // document.querySelector('.form_el input[name="username"')?.parentElement?.classList.add('error')
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

    const authUser = await fetch(`${config.public.apiUrlAuth}/${config.public.envName}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({user: user.value, password: password.value})
    })
    .then(res => res.json())
    .catch(er => {
        console.log('er', er);     
    })
    console.log('!!!!authUser!!!!', authUser);

    if (!authUser.success) {
        console.log('Error logging in....');
        errMsg.value = authUser?.message;
        return
    } else {
        errMsg.value = '';
        await updateStore(authUser.data.user, authUser.data.token);
        await getUserData();
    }
}

// NUXT SERVER
// const getUserDataNuxt = async () => {
//     const res = await fetch(`/api/study-items/get?user=viktoria`)
//     .then(res => res.json());

//     console.log('res fe', res);
// }

onMounted(async() => {
    console.log('Runtime config API_URL:', config.public.apiUrl)
    console.log('Runtime config API_KEY:', config.public.apiKey)
    console.log('Runtime config ENV_NAME:', config.public.envName)
    // getUserDataNuxt();

    if (cookieUser.value && cookieToken.value) {
        await updateStore(cookieUser.value, cookieToken.value);
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
        }
    }
</style>


<i18n lang="yaml">
    en:
        helloMsg: 'Please, sign in to continue'
        submit: 'Login'
        username: 'Username'
        password: 'Password'
        userNameEmptyErr: 'Please, enter your username'
        passwordNameEmptyErr: 'Please, enter your password'
        noUserFoundErr: 'No user found'
        languageMenuTitle: "Select the language you're learning"
    ru:
        helloMsg: 'Пожалуйста, введите Ваш логин и пароль'
        submit: 'Войти'
        username: 'Логин'
        password: 'Пароль'
        userNameEmptyErr: 'Пожалуйста, введите ваш логин'
        passwordNameEmptyErr: 'Пожалуйста, введите ваш пароль'
        noUserFoundErr: 'Пользователь не найден'
        languageMenuTitle: 'Выбирите язык который изучаете'
    zh:
        helloMsg: 'TBD'
        submit: 'TBD'
        username: 'TBD'
        password: 'TBD'
        userNameEmptyErr: 'TBD'
        passwordNameEmptyErr: 'TBD'
        noUserFoundErr: 'TBD'
        languageMenuTitle: 'TBD'
</i18n>