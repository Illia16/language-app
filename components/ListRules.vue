<template>
    <div>
        <h1>{{ t('selectRule') }}</h1>
        <ul class="list-items">
            <li v-for="(item, i) of ['presentSimple', 'presentContinuous', 'presentPerfect']" :key="item+i">
                <button @click="() => handleClick(item)" class="custom-button-link">
                    {{t(item)}}
                    ({{t(item, 0, { locale: 'en' })}})
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
