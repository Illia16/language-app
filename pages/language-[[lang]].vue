<template>
    <template v-if="!store.lessonStarted">
        <GrammarEng v-if="$route.params.lang === 'en'" />
        <section class="learning-data">
            <div class="learning-data--itemType">
                <h2>{{ t('selectExercise') }}</h2>
                <div v-for="(itemTypeEl, i) of itemType" :key="i" class="exercise-checkbox" tabindex="0">
                    <label>
                        <input
                        tabindex="-1"
                        class="sr-only"
                        type="checkbox"
                        :name="itemTypeEl"
                        v-model="v_selecteditemType[itemTypeEl]" />
                        <span class="checkbox-bg"></span>
                        <span class="input-name">
                            {{itemTypeEl}}
                        </span>
                    </label>
                </div>
            </div>

            <div class="learning-data--itemTypeCategory">
                <h2>{{ t('selectSubExercise') }}</h2>
                <div v-for="(itemTypeCategoryEl, i) of itemTypeCategory" :key="i" class="exercise-checkbox" tabindex="0">
                    <label>
                        <input
                            tabindex="-1"
                            class="sr-only"
                            type="checkbox"
                            :name="itemTypeCategoryEl"
                            v-model="v_selecteditemTypeCategory[itemTypeCategoryEl]"
                        />
                        <span class="checkbox-bg"></span>
                        <span class="input-name">
                            {{itemTypeCategoryEl}}
                        </span>
                    </label>
                </div>
            </div>

            <div class="learning-data--mode">
                <h2>{{ t('modeTitle') }}</h2>
                <div v-for="(mode, i) of [mapModes.wordListening, mapModes.wordTranslation, mapModes.translationWord, mapModes.wordTranslationMPChoice, mapModes.translationWordMPChoice, mapModes.sentenceWordTranslation, mapModes.sentenceTranslationWord, mapModes.random]" :key="`${mode}'_'${i}`" class='mode-radio' tabindex="0">
                    <label>
                        <input
                            tabindex="-1"
                            class="sr-only"
                            type="radio"
                            name="mode"
                            :value="mode"
                            v-model="modeSelected"
                        />
                        <span class="radio-bg"></span>
                        <span class="input-name">{{ t(mode) }}</span>
                    </label>
                </div>
            </div>

            <div v-if="numQuestions && numQuestions.length" class="learning-data--numQuestions">
                <h2 v-html="t('numberQ')"></h2>
                <div v-for="(number, key) of numQuestions" :key="`number-of-q-key-${key}`" class="num-of-q-checkbox" tabindex="0">
                    <label>
                        <input
                            tabindex="-1"
                            class="sr-only"
                            type="radio"
                            name="number-of-q"
                            :value="number"
                            v-model="numQuestionsSelected"
                        />
                        <span class="radio-bg"></span>
                        <span class="input-name">{{number}}</span>
                    </label>
                </div>
            </div>
        </section>

        <button class="custom-button-link" @click="store.setLessonStarted(true)" :disabled="initData.every(el => !el) || numQuestionsSelected < 1 || !modeSelected">
            {{ t('startBtn') }}
        </button>
    </template>

    <section v-if="store.lessonStarted" class="lesson-started">
        <p :class="[`${isCorrect(currentQuestion, userAnswer) ? 'correct-answer' : 'incorrect-answer'}`]">
            <template v-if="currentQuestionAnswered">
                {{isCorrect(currentQuestion, userAnswer) ? "Correct!" : "Incorrect, correct answer is: " + currentQuestion?.qAnswer}}
            </template>
        </p>

        <div class="lesson-started--qNumHint">
            <span>
                {{ t('questionNumber', { currentQuestionNum: currentQuestionNum, lessonDataLength: lessonData?.length }) }}
            </span>
            <button @click="store.setModalOpen(true); store.setModalType('grammar')">{{ t('rules') }}</button>
        </div>

        <div class="lesson-started--question">
            <span>
                {{ t('question') }}
            </span>
            <AudioPlayer
                v-if="currentQuestion.fileUrl &&
                [mapModes.wordListening, mapModes.wordTranslation, mapModes.wordTranslationMPChoice, mapModes.sentenceWordTranslation].includes(currentQuestion.mode) &&
                !currentQuestionAnswered
                "
                :file="currentQuestion.fileUrl"
                :playRightAway="true"
            >
            </AudioPlayer>
            <span :class="`lesson-started--question-text lesson-started--question-text--${detectLanguage(currentQuestion.question)}`">
                <span
                    v-if="[mapModes.wordTranslation, mapModes.translationWord, mapModes.wordTranslationMPChoice, mapModes.translationWordMPChoice, mapModes.sentenceWordTranslation, mapModes.sentenceTranslationWord, mapModes.random].includes(currentQuestion.mode)"
                    :class="!currentQuestionAnswered ? 'animated-text' : ''">
                    {{currentQuestion.question}}
                </span>
                <span
                    v-if="currentQuestion.itemTranscription
                    && [mapModes.wordTranslation, mapModes.wordTranslationMPChoice, mapModes.sentenceWordTranslation].includes(currentQuestion.mode)"
                    class="lesson-started--question-text-transcription"
                >
                    ({{ currentQuestion.itemTranscription }})
                </span>
            </span>
        </div>

        <!--MODE: Write text -->
        <div
            class="form_el"
            v-if="currentQuestion.mode === mapModes.wordTranslation ||
                currentQuestion.mode === mapModes.translationWord ||
                currentQuestion.mode === mapModes.wordListening
            ">
            <label>
                <input
                    type="text"
                    v-model="userAnswer"
                    :placeholder="t('yourAnswer') + (currentQuestion.mode === mapModes.wordListening ? ' ' + t('studyingLang') : '') "
                    :disabled="currentQuestionAnswered"
                />
            </label>
        </div>

        <!--MODE: Multiple Choice -->
        <div :class="`lesson-started-mp-choice lesson-started-mp-choice--${detectLanguage(currentQuestion.qAnswer)}`" v-if="currentQuestion.mode === mapModes.wordTranslationMPChoice || currentQuestion.mode === mapModes.translationWordMPChoice">
            <div v-for="(q, key) of currentQuestion.all" :key="`mp-choice-q-key-${key}`" class="mp-choice-checkbox" tabindex="0">
                <label :class="[`${currentQuestionAnswered ? 'lesson-started-mp-choice-answered' : ''}`]">
                    <input
                        tabindex="-1"
                        class="sr-only"
                        type="radio"
                        name="number-of-q"
                        :disabled="currentQuestionAnswered"
                        :value="q.item"
                        v-model="userAnswer"
                    />
                    <span class="tense-name">
                        <span class="tense-name--item">
                            {{q.item}}
                        </span>
                        <span
                            v-if="q.itemTranscription
                            && [mapModes.translationWord, mapModes.translationWordMPChoice, mapModes.sentenceTranslationWord].includes(currentQuestion.mode)"
                            class="tense-name--item-transcription"
                        >
                            ({{ q.itemTranscription }})
                        </span>
                    </span>
                </label>
            </div>
        </div>

        <!--MODE: Sentence Builer -->
        <template v-if="currentQuestion.mode === mapModes.sentenceWordTranslation || currentQuestion.mode === mapModes.sentenceTranslationWord">
            <div :class="`lesson-started--sentenceBuiler lesson-started--sentenceBuiler--${detectLanguage(currentQuestion.qAnswer)}`">
                <button
                    @click="userAnswer ? userAnswer = userAnswer + (lessonData[0].languageStudying === 'zh' && currentQuestion.mode === mapModes.sentenceTranslationWord ? '' : ' ') + word : userAnswer = word"
                    v-for="(word, key) of currentQuestion.splitted"
                    :key="`sentence-builer-q-key-${key}`"
                    class="custom-button-link custom-button-link--mp-choice"
                    :disabled="currentQuestionAnswered">
                    {{word}}
                </button>
            </div>

            <div :class="`lesson-started--sentenceBuiler-userAnswer lesson-started--sentenceBuiler-userAnswer--${detectLanguage(currentQuestion.qAnswer)}`">
                <h4>{{ t('yourAnswer') }}</h4>
                <div class="lesson-started--sentenceBuiler-userAnswer-dynamic">{{userAnswer}}</div>

                <div class="lesson-started--sentenceBuiler-userAnswer-clearBtn">
                    <button class="custom-button-link-secondary" @click="userAnswer = ''" :disabled="!userAnswer || currentQuestionAnswered">
                        {{ t('clearBtn') }}
                    </button>
                </div>
            </div>
        </template>

        <ul class="lesson-started--checkBtn-nextQBtn">
            <li>
                <button class="custom-button-link" @click="check" :disabled="!userAnswer || currentQuestionAnswered">
                    {{ t('checkBtn') }}
                </button>
            </li>


            <li v-if="currentQuestionNum < lessonData?.length">
                <button class="custom-button-link"  @click="nextQuestion" :disabled="!currentQuestionAnswered">
                    {{ t('nextQBtn') }}
                </button>
            </li>
        </ul>

        <!-- play audio once a question is answered whether it's answered right or wrong -->
        <AudioPlayer
            class="invisible"
            v-if="currentQuestion.fileUrl && currentQuestionAnswered"
            :file="currentQuestion.fileUrl"
            :playRightAway="true"
        ></AudioPlayer>

        <teleport to="body">
            <Modal v-if="store.modalOpen && store.modalType === 'grammar'">
                <GrammarRulesEng v-if="$route.params.lang === 'en'" :rule="currentQuestion.rule" />
            </Modal>
        </teleport>

        <teleport to="body">
            <Modal v-if="store.modalOpen && store.modalType === 'grammar' && $route.params.lang === 'zh'">
                <p>{{ currentQuestion.itemTranscription }}</p>
            </Modal>
        </teleport>

        <teleport to="body">
            <Modal v-if="store.modalOpen && store.modalType === 'report'">
                <LessonReport :report="report" :numOfCorrectAnswers="numOfCorrectAnswers" />
            </Modal>
        </teleport>
    </section>
</template>


<script lang="ts" setup>
import GrammarEng from 'components/english/GrammarEng.vue';
import GrammarRulesEng from 'components/english/GrammarRulesEng.vue';
import { useMainStore } from 'store/main';
import { getLesson, getQuestion, isCorrect, mapModes, detectLanguage } from 'helper/helpers';
import { type UserDataArrayOfObj, type Question, type ReportArrayOfObj, type RecordUserAnswerDestructured, type Report } from 'types/helperTypes'
const store = useMainStore();
const { t } = useI18n({useScope: 'local'})
const route = useRoute()

const itemType = computed<string[]>(() => store.userLangData
    .filter(el => el.languageStudying === route.params.lang)
    .map(el => el.itemType)
    .reduce(function (acc, cv) {
        if (!acc.includes(cv)){
            acc.push(cv)
        }
        return acc;
    }, [])
);

const itemTypeCategory = computed<string[]>(() => store.userLangData
    .filter(el => el.languageStudying === route.params.lang)
    .map(el => v_selecteditemType.value[el.itemType] ? el.itemTypeCategory : null)
    .filter(el => el)
    .reduce(function (acc, cv) {
        if (!acc.includes(cv)){
            acc.push(cv)
        }
        return acc;
    }, [])
);

const v_selecteditemType = ref({}) // v-model for selected itemType
const v_selecteditemTypeCategory = ref({}) // v-model for selected itemTypeCategory

const modeSelected = ref<string>('');
const numQuestionsSelected = ref<number>(0); // num of questions in the lesson selected by user dynamically based on how many questions are available


const initData = computed<UserDataArrayOfObj>((): UserDataArrayOfObj => store.userLangData
    .filter(el => el.languageStudying === route.params.lang)
    .filter((el, i, arr) => {
        return v_selecteditemType.value[el.itemType] && v_selecteditemTypeCategory.value[el.itemTypeCategory]
        || v_selecteditemType.value[el.itemType] && !v_selecteditemTypeCategory.value[el.itemTypeCategory] && v_selecteditemTypeCategory.value[el.itemTypeCategory]
    })
    .map(el => {
        // diff splitter for Eng and Mandarin since the latter doesn't have spaces in sentences
        const splitter = el.languageStudying === 'en' ? ' ' : '';

        if (modeSelected.value === mapModes.sentenceWordTranslation && el.item.split(splitter).length > 1 ||
            modeSelected.value === mapModes.sentenceTranslationWord && el.item.split(splitter).length > 1) {
            return el;
        }

        if (
            modeSelected.value !== mapModes.sentenceWordTranslation &&
            modeSelected.value !== mapModes.sentenceTranslationWord &&
            modeSelected.value !== mapModes.wordListening
        ) {
            return el;
        }

        // for wordListening mode
        if (
            modeSelected.value === mapModes.wordListening && el.filePath && el.fileUrl
        ) {
            return el;
        }
    })
    .filter(el => el) as UserDataArrayOfObj
);

const numQuestions = computed<number[]>(() => {
    return  [
        initData.value.length > 0 && initData.value.length < 5 ? initData.value.length : 0,
        initData.value.length >= 5 ? 5 : 0,
        initData.value.length >= 10 ? 10 : 0,
    ]
    .filter(el=>el)
}) // number of questions generated based on how many exersises available


// lesson state
const lessonData = ref<UserDataArrayOfObj>([]);
const currentQuestionNum = ref<number>(1);
const currentQuestion = ref<Question>({} as Question);
const currentQuestionAnswered = ref<boolean>(false);
const userAnswer = ref<string>('');
const numOfCorrectAnswers = ref<number>(0);
const report = ref<ReportArrayOfObj>([]);

watch(currentQuestionNum, function() {
    if (lessonData.value && lessonData.value.length) {
        currentQuestion.value = getQuestion(modeSelected.value, lessonData.value, currentQuestionNum.value);
    }
});

// set report modal open
watch(currentQuestionAnswered, function() {
    if (lessonData.value.length === currentQuestionNum.value && currentQuestionAnswered.value) {
        store.setModalOpen(true);
        store.setModalType('report')
    }
});

// handling incorrect, correct answers and if no more questions, stopping the lesson
const check = ():void => {
    if (!isCorrect(currentQuestion.value, userAnswer.value)) {
        currentQuestionAnswered.value = true;
        recordUserAnswer(false, userAnswer.value, currentQuestion.value);
    } else {
        currentQuestionAnswered.value = true;
        recordUserAnswer(true, userAnswer.value, currentQuestion.value);
        numOfCorrectAnswers.value = numOfCorrectAnswers.value + 1;
    }
};

// recording answers, their correctness for report at the end and updating API.
const recordUserAnswer = (correct: boolean, userAnswer: string, { qAnswer, question, id, level, item }:RecordUserAnswerDestructured ):void => {
    const r:Report = {} as Report;
    r.question = question;
    r.userAnswer = userAnswer;
    r.correctAnswer = qAnswer;
    r.id = id;
    r.level = level;
    r.item = item;

    if (correct) {
        r.isCorrect = true;
    } else {
        r.isCorrect = false;
    }

    report.value = [...report.value, r];
};

const nextQuestion = ():void => {
    currentQuestionNum.value = currentQuestionNum.value + 1;
    currentQuestionAnswered.value = false;
    userAnswer.value = '';
};

watch(() => store.lessonStarted, (v) => {
    if (v) {
        lessonData.value = getLesson(modeSelected.value, initData.value).slice(0, numQuestionsSelected.value) as UserDataArrayOfObj;

        if (lessonData.value && lessonData.value.length) {
            currentQuestion.value = getQuestion(modeSelected.value, lessonData.value, currentQuestionNum.value);
        }
    } else {
        lessonData.value = [];
        currentQuestionNum.value = 1;
        currentQuestion.value = {} as Question;
        currentQuestionAnswered.value = false;
        userAnswer.value = ''
        numOfCorrectAnswers.value = 0;
        report.value = [];
    }
});

onBeforeMount(() => {
    document.body.classList.add(`language-learning--${route.params.lang}`)
})

onBeforeUnmount(() => {
    document.body.classList.remove(`language-learning--${route.params.lang}`)
})
</script>

<style lang="scss">
section {
    @apply w-full my-4;

    &#grammar {
        @apply space-y-1;

        h2 {
            @apply text-center;
        }
    }

    &.learning-data {
        h2 {
            @apply mb-4;
        }
    }

    &.lesson-started {
        @apply my-0;

        p {
            @apply min-h-[55px] text-center flex justify-center items-center;
        }
    }
}

.animated-text {
    animation: show 2s;
}

@keyframes show {
    from {
        @apply opacity-0;
    }
    to {
        @apply opacity-100;
    }
}

.language-learning--en,
.language-learning--zh {
    .lesson-started {
        .lesson-started--qNumHint {
            @apply flex flex-col items-center text-center mb-8 space-y-2;

            button {
                @apply bg-mainGreen text-white py-1 px-1;
            }
        }

        .lesson-started--question {
            @apply text-center mb-8 flex flex-col;

            .lesson-started--question-text {
                @apply flex flex-col justify-center items-center text-2xl;

                .lesson-started--question-text-transcription {
                    @apply text-xl;
                }
            }

            .lesson-started--question-text {
              @apply font-extralight;

              &.lesson-started--question-text--zh {
                @apply  text-6xl leading-normal pt-4;
              }
            }
        }

        .form_el {
          input {
            @apply text-4xl py-4;
          }
        }

        .lesson-started-mp-choice {
            @apply my-3;

            label {
                @apply inline-block border border-mainGreen;
                &.lesson-started-mp-choice-answered {
                    @apply opacity-25;
                }
            }

            .mp-choice-checkbox {
                @apply mb-2;

                label {
                    @apply w-full;
                }

                .tense-name {
                    @apply flex p-2 w-full items-center;

                    .tense-name--item {
                      @apply font-extralight;
                    }

                }
                input:checked ~ .tense-name {
                    @apply bg-mainGreen text-white;
                }
            }

            &.lesson-started-mp-choice--zh {
              .tense-name {
                .tense-name--item {
                  @apply text-4xl;
                }
              }
            }
        }

        .lesson-started--sentenceBuiler {
            @apply my-5 flex justify-center flex-wrap;

            button {
              @apply font-extralight;
            }

            &.lesson-started--sentenceBuiler--zh {
              button {
                @apply text-7xl p-3;
              }
            }
        }

        .lesson-started--sentenceBuiler-userAnswer {
            @apply text-center mb-4;

            h4 {
                @apply text-center;
            }

            .lesson-started--sentenceBuiler-userAnswer-dynamic {
                @apply min-h-[40px] text-center text-2xl font-extralight;
            }

            .lesson-started--sentenceBuiler-userAnswer-clearBtn {
                @apply text-center;
            }

            &.lesson-started--sentenceBuiler-userAnswer--zh {
              .lesson-started--sentenceBuiler-userAnswer-dynamic {
                @apply text-7xl my-10;
              }
            }
        }

        .lesson-started--checkBtn-nextQBtn {
            @apply my-12;

            li {
                @apply min-w-[175px];

                button {
                    @apply mt-3 w-full;
                }
            }
        }
    }
}
</style>


<i18n lang="yaml">
    en:
        selectExercise: 'Select a section:'
        selectSubExercise: 'Select an exercise or multiple exercises from this section:'
        modeTitle: 'Select a learning mode'
        numberQ: 'Select a number of questions:'
        wordListening: 'Listening'
        wordTranslation: 'Writing: Translation from learning language'
        translationWord: 'Writing: Translation to learning language'
        wordTranslationMPChoice: 'Multiple Choice: Translation from learning language'
        translationWordMPChoice: 'Multiple Choice: Translation to learning language'
        sentenceWordTranslation: 'Sentence: Translation from learning language'
        sentenceTranslationWord: 'Sentence: Translation to learning language'
        random: 'All'
        startBtn: 'Start'
        questionNumber: 'Question number is {currentQuestionNum} out of {lessonDataLength}'
        question: 'Question:'
        yourAnswer: 'Your answer'
        studyingLang: 'the language you are studying'
        clearBtn: 'Clear'
        checkBtn: 'Check'
        nextQBtn: 'Next question'
        rules: 'Hint'
    ru:
        selectExercise: 'Выберите упражнение или несколько упражнений:'
        selectSubExercise: 'Выберите под-секцию:'
        modeTitle: 'Выберите режим обучения'
        numberQ: 'Выберите количество вопросов:'
        wordListening: 'Слушание'
        wordTranslation: 'Написание: Перевод с изучаемого языка'
        translationWord: 'Написание: Перевод на изучаемый язык'
        wordTranslationMPChoice: 'Несколько вариантов ответа: Перевод с изучаемого языка'
        translationWordMPChoice: 'Несколько вариантов ответа: Перевод на изучаемый язык'
        sentenceWordTranslation: 'Предложение: Перевод с изучаемого языка'
        sentenceTranslationWord: 'Предложение: Перевод на изучаемый язык'
        random: 'Все тренировки'
        startBtn: "Начать"
        questionNumber: 'Номер вопроса {currentQuestionNum} из {lessonDataLength}'
        question: 'Вопрос:'
        yourAnswer: 'Ваш ответ'
        studyingLang: 'на языке который изучаете'
        clearBtn: 'Очистить'
        checkBtn: 'Проверить'
        nextQBtn: 'Следующий вопрос'
        rules: 'Подсказка'
    zh:
        selectExercise: '選擇一個部分'
        selectSubExercise: '選擇一個或多個練習'
        modeTitle: '選擇學習模式'
        numberQ: '選擇問題數量'
        wordListening: '聆聽'
        wordTranslation: '寫作: 翻譯 - 學習語言'
        translationWord: '寫作: 翻譯 - 學習語言'
        wordTranslationMPChoice: '多選: 翻譯 - 學習語言'
        translationWordMPChoice: '多選: 翻譯 - 學習語言'
        sentenceWordTranslation: '句子: 翻譯 - 单词'
        sentenceTranslationWord: '句子: 翻譯 - 學習語言'
        random: '全部'
        startBtn: '開始'
        questionNumber: '問題數量 {currentQuestionNum} out of {lessonDataLength}'
        question: '問題:'
        yourAnswer: '你的答案'
        studyingLang: '你正在學習的語言'
        clearBtn: '清除'
        checkBtn: '檢查'
        nextQBtn: '下一個問題'
        rules: '提示'
</i18n>
