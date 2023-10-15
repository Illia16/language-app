<template>
    <div class="main-page">
        <!-- <Auth /> -->

        <!-- App interface languages -->
        <template v-if="!store.lang">
            <h1>{{ t('welcomeMessage') }}</h1>
            <ul class="list-items">
                <li v-for="(user_language, i) of ['en', 'ru', 'zh']" :key="i">
                    <NuxtLink class="custom-button-link" :to="switchLocalePath(user_language)" @click="store.setLang(user_language)">{{mapLanguage(user_language)}}</NuxtLink>
                </li>
            </ul>
        </template>

        <!-- App menu -->
        <template v-if="store.lang">
            <h1>{{ t('mainMenu.grammar') }}</h1>
            <h2>{{ t('tenses') }}</h2>
            <Table class="grammar-table">
                <li>
                    <ul>
                        <li></li>
                        <li>Simple</li>
                        <li>Continuous</li>
                        <li>Perfect</li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li>Present</li>
                        <li v-for="(tense, i) of ['presentSimple', 'presentContinuous', 'presentPerfect']" :key="tense+i">
                            <button @click="() => handleClick(tense)" class="underline font-bold">
                                {{t('mainMenu.look')}}
                            </button>
                        </li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li>Past</li>
                        <li v-for="(tense, i) of ['pastSimple', 'pastContinuous', 'pastPerfect']" :key="tense+i">
                            <button @click="() => handleClick(tense)">
                                {{t('mainMenu.look')}}
                            </button>
                        </li>
                    </ul>
                </li>
                <li>
                    <ul>
                        <li>Future</li>
                        <li v-for="(tense, i) of ['futureSimple', 'futureContinuous', 'futurePerfect']" :key="tense+i">
                            <button @click="() => handleClick(tense)">
                                {{t('mainMenu.look')}}
                            </button>
                        </li>
                    </ul>
                </li>
            </Table>

            <h2>{{ t('mainMenu.other') }}</h2>
            <ul class="list-items">
                <li>
                    <button @click="() => handleClick('irregularVerbs')" class="custom-button-link">
                        {{t('irregularVerbs')}}
                    </button>
                </li>
            </ul>
            <teleport to="body">
                <Modal v-if="store.modalOpen && store.modalType === 'grammar'">
                    <GrammarRules :rule="grammarRule" />
                </Modal>
            </teleport>

            <h2 class="tasks">{{ t('selectTask') }}</h2>
            <ul class="list-items">
                <li v-for="(task, i) of ['tenses', 'words', 'modal-verbs']" :key="task+i">
                    <NuxtLink :to="localePath({ name: task })" class="custom-button-link">{{ t(task) }}</NuxtLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
import { mapLanguage } from 'helper/helpers';

const config = useRuntimeConfig();
const store = useMainStore();
const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

useHead({
    title: 'Language App',
    htmlAttrs: {
        lang: locale,
    }
})

const grammarRule = ref<string>("");

const handleClick = (v: string):void => {
    store.setModalOpen(true);
    store.setModalType('grammar');
    grammarRule.value = v;
}

const getUserData = async () => {
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=illia`)
    .then(res => res.json());

    console.log('res', res);
}

const postUserData = async () => {
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=illia`, {
        method: 'POST',
        body: JSON.stringify([
            {
                "user": "illia", 
                "itemID": "test-1",
                "item": "你",
                "itemCorrect": "Ты",
                "itemType": "word",
                "itemTypeCategory": "mandarinChar",
                "languageMortherTongue": "ru",
                "languageStudying": "cn",
                "level": "0"
            },
            {
                "user": "illia",
                "itemID": "test-2",
                "item": "你",
                "itemCorrect": "Ты",
                "itemType": "word",
                "itemTypeCategory": "mandarinChar",
                "languageMortherTongue": "ru",
                "languageStudying": "cn",
                "level": "0"
            }
        ])
    })
    .then(res => res.json());
    console.log('res', res);
}

const putUserData = async () => {
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=illia`, {
        method: 'PUT',
        body: JSON.stringify([
            {
                "user": "illia",
                "itemID": "test-1",
                "keyToUpdate": {
                    "name": "level",
                    "value": "1"
                }
            },
            {
                "user": "illia",
                "itemID": "test-2",
                "keyToUpdate": {
                    "name": "level",
                    "value": "1"
                }
            }
        ])
    })
    .then(res => res.json());
    console.log('res', res);
}

const deleteUserData = async () => {
    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=illia`, {
        method: 'DELETE',
        body: JSON.stringify([
            {
                "user": "illia", 
                "itemID": "test-1"
            },
            {
                "user": "illia",
                "itemID": "test-2"
            }
        ])
    })
    .then(res => res.json());
    console.log('res', res);
}

const getUserDataNuxt = async () => {
    const res = await fetch(`/api/study-items/get?user=viktoria`)
    .then(res => res.json());

    console.log('res fe', res);
}

onMounted(() => {
    console.log('Runtime config API_URL:', config.public.apiUrl)
    console.log('Runtime config API_KEY:', config.public.apiKey)
    console.log('Runtime config ENV_NAME:', config.public.envName)

    // getUserDataNuxt();
    // getUserData();
    // postUserData();
    // putUserData();
    // deleteUserData();
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
    }
</style>

