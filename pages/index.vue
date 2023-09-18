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

