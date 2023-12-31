<template>
    <section id="grammar">
        <h2>{{ t('tenses') }}</h2>
        <Table class="grammar-table">
            <li>
                <ul>
                    <li><span class="sr-only">table column</span></li>
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
                        <button @click="() => handleClick(tense)" class="underline font-bold">
                            {{t('mainMenu.look')}}
                        </button>
                    </li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>Future</li>
                    <li v-for="(tense, i) of ['futureSimple', 'futureContinuous', 'futurePerfect']" :key="tense+i">
                        <button @click="() => handleClick(tense)" class="underline font-bold">
                            {{t('mainMenu.look')}}
                        </button>
                    </li>
                </ul>
            </li>
        </Table>

        <h2>{{ t('tensesPassive') }}</h2>
        <Table class="grammar-table">
            <li>
                <ul>
                    <li><span class="sr-only">table column</span></li>
                    <li>Simple</li>
                    <li>Continuous</li>
                    <li>Perfect</li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>Present</li>
                    <li v-for="(tense, i) of ['presentSimplePassive', 'presentContinuousPassive', 'presentPerfectPassive']" :key="tense+i">
                        <button @click="() => handleClick(tense)" class="underline font-bold">
                            {{t('mainMenu.look')}}
                        </button>
                    </li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>Past</li>
                    <li v-for="(tense, i) of ['pastSimplePassive', 'pastContinuousPassive', 'pastPerfectPassive']" :key="tense+i">
                        <button @click="() => handleClick(tense)" class="underline font-bold">
                            {{t('mainMenu.look')}}
                        </button>
                    </li>
                </ul>
            </li>
            <li>
                <ul>
                    <li>Future</li>
                    <li v-for="(tense, i) of ['futureSimplePassive', 'futureContinuousPassive', 'futurePerfectPassive']" :key="tense+i">
                        <button @click="() => handleClick(tense)" class="underline font-bold">
                            {{t('mainMenu.look')}}
                        </button>
                    </li>
                </ul>
            </li>
        </Table>

        <h2>{{ t('mainMenu.other') }}</h2>
        <Table class="irregular-verbs-table">
            <li>
                <ul>
                    <li>
                        <button @click="() => handleClick('irregularVerbs')">
                            {{t('irregularVerbs')}}
                        </button>
                    </li>
                </ul>
            </li>
        </Table>

        <teleport to="body">
            <Modal v-if="store.modalOpen && store.modalType === 'grammar'">
                <GrammarRulesEng :rule="grammarRule" />
            </Modal>
        </teleport>
    </section>
</template>


<script lang="ts" setup>

import { useMainStore } from 'store/main';
const store = useMainStore();
import GrammarRulesEng from 'components/english/GrammarRulesEng.vue';
const { t } = useI18n({useScope: 'local'})

const grammarRule = ref<string>("");

const handleClick = (v: string):void => {
    store.setModalOpen(true);
    store.setModalType('grammar');
    grammarRule.value = v;
}

</script>

<i18n lang="yaml">
    en:
        tenses: "Tenses"
        tensesPassive: Tenses in passive
        mainMenu:
            look: 'Look'
            other: 'Other'
            grammar: 'Grammar'
        irregularVerbs: 'Irregular verbs'
    ru:
        tenses: "Времена"
        tensesPassive: Времена в пассиве
        mainMenu:
            look: 'Смотреть'
            other: 'Другое'
            grammar: 'Грамматика'
        irregularVerbs: 'Неправильные глаголы'
    zh:
        tenses: "时态"
        tensesPassive: Tenses in passive
        mainMenu:
            look: '看看'
            other: '其他'
            grammar: '语法'
        irregularVerbs: 'TBD'
</i18n>
