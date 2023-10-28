<template>
    <div class="main-page">        
        <form id="user_login" v-if="!store.userLangData.length">
            <div class="form_el">
                <label>Username:</label>
                <input type="text" v-model="user" />
            </div>

            <div class="form_el">
                <label> Password: </label>
                <input type="text" v-model="password" />
            </div>

            <button type="button" @click="getUserData" class="custom-button-link">
                Submit
            </button>
        </form>

        <!-- User languages in progress -->
        <template v-if="store.userLangData.length">
            <h1>Select the language you're learning:</h1>
            <ul class="list-items">
                <li v-for="(user_language, i) of userLanguagesInProgress" :key="i">
                    <!-- <NuxtLink class="custom-button-link" :to="switchLocalePath(user_language)">{{mapLanguage(user_language)}}</NuxtLink> -->
                    <NuxtLink class="custom-button-link" :to="'/language-' + user_language">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </template>
        
        <!-- App interface languages -->
        <!-- <template v-if="!store.lang">
            <h1>{{ t('welcomeMessage') }}</h1>
            <ul class="list-items">
                <li v-for="(user_language, i) of ['en', 'ru', 'zh']" :key="i">
                    <NuxtLink class="custom-button-link" :to="switchLocalePath(user_language)" @click="store.setLang(user_language)">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </template> -->

        <!-- App menu -->
        <!-- <template v-if="store.lang">
            <h2 class="tasks">{{ t('selectTask') }}</h2>
            <ul class="list-items">
                <li v-for="(task, i) of ['tenses', 'words', 'modal-verbs']" :key="task+i">
                    <NuxtLink :to="localePath({ name: task })" class="custom-button-link">{{ t(task) }}</NuxtLink>
                </li>
            </ul>
        </template> -->
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { mapLanguage } from 'helper/helpers';

const config = useRuntimeConfig();
const store = useMainStore();
const { locale, t, availableLocales, getBrowserLocale, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

useHead({
    title: 'Language App',
    htmlAttrs: {
        lang: locale,
    }
})

const user = ref<string>('');
const password = ref<string>('');
const userLanguagesInProgress = computed<string[]>(() => store.userLangData.reduce(function (acc, cv) {
    if (!acc.includes(cv.languageStudying)){
        acc.push(cv.languageStudying)
    }
    return acc
}, []))

const getUserData = async () => {

    if (!user.value || !password.value) {
        return
    }
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${user.value}`)
    .then(res => res.json());

    // const res = [
    //     {
    //         "level": "0",
    //         "languageStudying": "es",
    //         "itemTypeCategory": "",
    //         "user": "illia",
    //         "itemType": "word",
    //         "languageMortherTongue": "ru",
    //         "itemID": "tú-21321329",
    //         "item": "tú",
    //         "itemCorrect": "Ты"
    //     },
    //     {
    //         "level": "0",
    //         "languageStudying": "zh",
    //         "itemTypeCategory": "mandarinChar",
    //         "user": "illia",
    //         "itemType": "word",
    //         "languageMortherTongue": "ru",
    //         "itemID": "ты-21321322",
    //         "item": "你",
    //         "itemCorrect": "Ты"
    //     },
    //     {
    //         "level": "0",
    //         "languageStudying": "zh",
    //         "itemTypeCategory": "mandarinChar",
    //         "user": "illia",
    //         "itemType": "word",
    //         "languageMortherTongue": "ru",
    //         "itemID": "я-21321321",
    //         "item": "我",
    //         "itemCorrect": "Я"
    //     },
    //     {
    //         "level": "0",
    //         "languageStudying": "en",
    //         "itemType": "sentence",
    //         "itemTypeCategory": "presentSimple",
    //         "user": "illia",
    //         "languageMortherTongue": "ru",
    //         "itemID": "ps-1",
    //         "item": "I cook every day",
    //         "itemCorrect": "Я готовлю каждый день"
    //     },
    //     {
    //         "level": "0",
    //         "languageStudying": "en",
    //         "itemType": "sentence",
    //         "itemTypeCategory": "presentSimple",
    //         "user": "illia",
    //         "languageMortherTongue": "ru",
    //         "itemID": "ps-2",
    //         "item": "I do not go to work every day",
    //         "itemCorrect": "Я не хожу на работу каждый день"
    //     },
    // ];

    console.log('res', res);
    store.setUserLangData(res);
    store.setCurrentUserName(user.value);
    const userMortherTongue = store.userLangData[0].languageMortherTongue;
    console.log('userMortherTongue', userMortherTongue);
    setLocale(userMortherTongue);
    store.setLang(userMortherTongue);    
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

watch(() => store.userLangData, function(v) {
    console.log('v', v);
});

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
    }
</style>

