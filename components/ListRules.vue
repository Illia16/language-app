<template>
    <div>
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
                        <button @click="() => handleClick(tense)">
                            {{t('mainMenu.look')}}
                        </button>
                    </li>
                </ul>
            </li>
            <!-- <li>
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
            </li> -->
        </Table>

        <h2>{{ t('mainMenu.other') }}</h2>
        <ul class="list-items">
            <li>
                <button @click="() => handleClick('irregularVerbs')" class="custom-button-link">
                    {{t('irregularVerbs')}}
                </button>
            </li>
        </ul>
    </div>
    <Modal v-if="store.modalOpen && store.modalType === 'grammar'">
        <GrammarRules :rule="grammarRule" />
    </Modal>
</template>


<script lang="ts" setup>
const { t } = useI18n()
import { useMainStore } from 'store/main';
const store = useMainStore();

const grammarRule = ref<string>("");

const handleClick = (v: string):void => {
    store.setModalOpen(true);
    store.setModalType('grammar');
    grammarRule.value = v;
}
</script>
