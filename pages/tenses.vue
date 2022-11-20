<template>
  <div>
    <NuxtLink to="/">Back to homepage</NuxtLink>
    <div>
        <Lesson
            v-if="store.lessonStarted"
            lessonType="tenses"
            :selectedData="selectedTenses"
            :selectedDataQuestions="allQuestions"
            :mode="modeSelected"
            :numQuestions="numQuestionsSelected" />

        <!-- TENSES -->
        <div v-if="tensesData && tensesData.length && !store.lessonStarted">
            <h2>Select an exersise or multiple exersises:</h2>
            <div v-for="(tense, i) of tensesData" :key="i" class="tense-checkbox" tabindex="0">
                <label>
                    <input
                        tabindex="-1"
                        class="sr-only"
                        type="checkbox"
                        :name="tense.name"
                        v-model="v_selectedTenses[i]" />
                    <span class="checkbox-bg"></span>
                    <span class="input-name">{{tense.name}}</span>
                </label>
            </div>

            <!-- NUMBER OF Qs -->
            <div v-if="numQuestions && numQuestions.length">
                <div id="number-of-q">
                    <h2>Select a number of questions: (default is <span>5</span>)</h2>
                    <div v-for="(number, key, i) of numQuestions" :key="i" class="num-of-q-checkbox" tabindex="0">
                        <label>
                            <input
                            tabindex="-1"
                            class="sr-only"
                            type="radio"
                            name="number-of-q"
                            @change="numQuestionsSelected = number"
                             />
                            <span class="radio-bg"></span>
                            <span class="input-name">{{number}}</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- MODES -->
            <div id="mode">
                <h2>Select a learning mode (default is <span>all types</span>)</h2>
                <div v-for="(mode, i) of ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord', 'random']" :key="i" class="mode-radio" tabindex="0">
                    <label>
                        <input
                        tabindex="-1"
                        class="sr-only"
                        type="radio"
                        name="mode"
                        @change="modeSelected = mode"
                            />
                        <span class="radio-bg"></span>
                        <span class="input-name">{{mapModeNames(mode)}}</span>
                    </label>
                </div>
            </div>

            <button @click="store.setLessonStarted(true)" :disabled="selectedTenses.every(el => !el)">
                Start
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { tensesData } from 'helper/tensesData'
import { useMainStore } from '@/store/main'
const store = useMainStore() // main store

const v_selectedTenses = ref([]) // v-model for selected checkboxes
const selectedTenses = computed(() => tensesData.map((el, i) => v_selectedTenses.value[i] ? el : null).filter(el => el)) // selected tenses full Object (can be more than 1)
const allQuestions = computed(() => selectedTenses.value.map((el, i) => el.data).flat()) // allQuestions in 1 array
const numQuestions = computed(() => [allQuestions.value.length >= 10 && 10, allQuestions.value.length >= 20 && 20, allQuestions.value.length >= 30 && 30, Math.round(allQuestions.value.length / 2), allQuestions.value.length].filter(el=>el)) // number of questions generated based on how many exersises available
const numQuestionsSelected = ref() // selected num of questions by user
const modeSelected = ref()

function mapModeNames(v) {
    switch (v) {
        case 'wordTranslation':
            return 'Word - Translation'
        case 'translationWord':
            return 'Translation - Word'
        case 'wordTranslationMPChoice':
            return 'Multiple Choice: Word - Translation'
        case 'translationWordMPChoice':
            return 'Multiple Choice: Translation - Word'
        case 'sentenceWordTranslation':
            return 'Sentence: Word - Translation'
        case 'sentenceTranslationWord':
            return 'Sentence: Translation - Word'
        case 'random':
            return 'All'
        default:
            return null
    }
}

</script>

<style lang="scss">
    .mode-radio,
    .num-of-q-checkbox,
    .tense-checkbox {
        @apply my-7;
        label {
            @apply relative;

            input {
                ~ .radio-bg,
                ~ .checkbox-bg {
                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 20px;
                        height: 20px;
                        border: 1px solid #000;
                        background: #fff;
                    }

                    &::after {
                        content: '';
                        width: 14px;
                        height: 14px;
                        background: #000;
                        position: absolute;
                        top: 3px;
                        left: 3px;
                        -webkit-transition: all 0.2s ease;
                        transition: all 0.2s ease;
                        opacity: 0;
                    }
                }

                &:checked {
                    ~ .radio-bg,
                    ~ .checkbox-bg {
                        &::after {
                            @apply opacity-100
                        }
                    }
                }
            }

            .input-name {
                @apply pl-7;
            }
        }
    }

    .mode-radio,
    .num-of-q-checkbox {
        label {
            input {
                ~ .radio-bg,
                ~ .checkbox-bg {
                    &::before,
                    &::after {
                        @apply rounded-full;
                    }
                }
            }
        }
    }

    button {
        @apply px-6 py-1 border border-black;
        &:disabled {
            @apply text-gray-400 border-gray-400;
        }
    }
</style>
