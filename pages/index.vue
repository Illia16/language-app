<template>
    <div class="main-page">        
        <form id="user_login" v-if="!store.userLangData.length">
            <div class="form_el">
                <label>{{ t('username') }}:</label>
                <input type="text" v-model="user" />
            </div>

            <div class="form_el">
                <label>{{ t('password') }}:</label>
                <input type="password" v-model="password" />
            </div>

            <button type="button" @click="getUserData" class="custom-button-link">
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

const user = ref<string>('');
const password = ref<string>('');
const userLanguagesInProgress = computed<string[]>(() => store.userLangData.reduce(function (accumulator:string[], currentValue:UserData) {
    if (!accumulator.includes(currentValue.languageStudying)){
        accumulator.push(currentValue.languageStudying)
    }
    return accumulator
}, []))

const getUserData = async () => {
    if (!user.value || !password.value) {
        return
    }
    
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${user.value}`)
    .then(res => res.json());

    console.log('res', res);
    store.setUserLangData(res);
    store.setCurrentUserName(user.value);
    const userMortherTongue = store.userLangData[0].languageMortherTongue;
    setLocale(userMortherTongue);
}

// NUXT SERVER
// const getUserDataNuxt = async () => {
//     const res = await fetch(`/api/study-items/get?user=viktoria`)
//     .then(res => res.json());

//     console.log('res fe', res);
// }

onMounted(() => {
    console.log('Runtime config API_URL:', config.public.apiUrl)
    console.log('Runtime config API_KEY:', config.public.apiKey)
    console.log('Runtime config ENV_NAME:', config.public.envName)
    // getUserDataNuxt();
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
        submit: 'Login'
        username: 'Username'
        password: 'Password'
        languageMenuTitle: "Select the language you're learning"
    ru:
        submit: 'Войти'
        username: 'Логин'
        password: 'Пароль'
        languageMenuTitle: 'Выбирите язык который изучаете'
    zh:
        submit: 'TBD'
        username: 'TBD'
        password: 'TBD'
        languageMenuTitle: 'TBD'
</i18n>