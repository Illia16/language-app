<template>
    <section id="grammar">
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
    </section>
</template>


<script lang="ts" setup>

import { useMainStore } from 'store/main';
const store = useMainStore();
import GrammarRules from 'components/english/GrammarRules.vue';
const { t } = useI18n({useScope: 'local'})

const grammarRule = ref<string>("");

const handleClick = (v: string):void => {
    store.setModalOpen(true);
    store.setModalType('grammar');
    grammarRule.value = v;
}

</script>

