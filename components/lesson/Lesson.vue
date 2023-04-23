<template>
    <div class="w-full">
        <div v-if="lessonType === 'all'">
            All options for a lesson
        </div>

        <template v-if="!store.lessonStarted">
            <!-- Exercise -->
            <template v-if="initData && initData.length && !store.lessonStarted">
                <div id="learning-data" class="learning-data">
                    <h2>{{ t('selectExercise') }}</h2>
                    <div v-for="(exercise, i) of initData" :key="i" class="exercise-checkbox" tabindex="0">
                        <label>
                            <input
                                tabindex="-1"
                                class="sr-only"
                                type="checkbox"
                                :name="exercise.name"
                                v-model="v_selectedExercise[i]" />
                            <span class="checkbox-bg"></span>
                            <span class="input-name">{{exercise.name}}</span>
                        </label>
                    </div>
                </div>

                <!-- MODES -->
                <div id="mode" class="mode">
                    <h2>{{ t('modeTitle') }}</h2>
                    <div v-for="
                        (mode, i) of lessonType === 'words' 
                        ? ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'random'] 
                        : ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord', 'random']" :key="i" class="mode-radio" tabindex="0">
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


                <!-- NUMBER OF Qs -->
                <template v-if="numQuestions && numQuestions.length">
                    <div id="number-of-q" class="number-of-q">
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
                </template>

                <button class="custom-button-link" @click="store.setLessonStarted(true)" :disabled="selectedExercises.every(el => !el) || numQuestionsSelected < 1">
                    {{ t('startBtn') }}
                </button>
            </template>
        </template>

        <template v-if="store.lessonStarted">
            <p :class="[`min-h-[55px] text-center flex justify-center items-center ${isCorrect(currentQuestion, userAnswer) ? 'correct-answer' : 'incorrect-answer'}`]">
                <template v-if="currentQuestionAnswered">
                    {{isCorrect(currentQuestion, userAnswer) ? "Correct!" : "Incorrect, correct answer is: " + currentQuestion?.qAnswer}}
                </template>
            </p>

            <div class="my-4">
                <div class="text-center mb-4">
                    {{ t('questionNumber', { currentQuestionNum: currentQuestionNum, lessonDataLength: lessonData?.length }) }}
                </div>

                <div class="text-center">
                    <button @click="store.setModalOpen(true); store.setModalType('grammar')" class="bg-mainGreen text-white py-1 px-3">{{ t('rules') }}</button>
                </div>

                <div class="text-center mb-4">
                    {{ t('question') }}
                    <span class="flex justify-center min-h-[50px]">
                        <span :class="!currentQuestionAnswered ? 'animated-text' : 'font-bold'">{{currentQuestion.question}}</span>
                    </span>
                </div>

                <div class="text-center">{{ t('yourAnswer') }}</div>
                <div class="min-h-[40px] text-center font-bold">{{userAnswer}}</div>

                <!--MODE: Write text -->
                <div class="my-3" v-if="currentQuestion.mode === 'wordTranslation' || currentQuestion.mode === 'translationWord'">
                    <label>
                        <input type="text" v-model="userAnswer" class="border border-black p-4 w-full text-center" />
                    </label>
                </div>

                <!--MODE: Multiple Choice -->
                <div class="my-3" v-if="currentQuestion.mode === 'wordTranslationMPChoice' || currentQuestion.mode === 'translationWordMPChoice'">
                    <div v-for="(q, key) of currentQuestion.all" :key="`mp-choice-q-key-${key}`" class="num-of-q-checkbox" tabindex="0">
                        <label :class="[`inline-block border border-mainGreen ${currentQuestionAnswered ? 'opacity-25' : ''}`]">
                            <input
                                tabindex="-1"
                                class="sr-only"
                                type="radio"
                                name="number-of-q"
                                :disabled="currentQuestionAnswered"
                                :value="q"
                                v-model="userAnswer"
                            />
                            <span></span>
                            <span class="tense-name">{{q}}</span>
                        </label>
                    </div>
                </div>

                <!--MODE: Sentence Builer -->
                <template v-if="lessonType !== 'words' && (currentQuestion.mode === 'sentenceWordTranslation' || currentQuestion.mode === 'sentenceTranslationWord')">
                    <div class="my-5 flex justify-center flex-wrap">
                        <button
                            @click="userAnswer ? userAnswer = userAnswer + ' ' + word : userAnswer = word"
                            v-for="(word, key) of currentQuestion.splitted"
                            :key="`sentence-builer-q-key-${key}`"
                            class="custom-button-link custom-button-link--mp-choice"
                            :disabled="currentQuestionAnswered">
                            {{word}}
                        </button>
                    </div>
                    <button class="custom-button-link" @click="userAnswer = ''" :disabled="!userAnswer || currentQuestionAnswered">
                        {{ t('clearBtn') }}
                    </button>
                </template>
            </div>

            <ul class="my-12">
                <li class="lesson-btns">
                    <button class="custom-button-link" @click="check" :disabled="!userAnswer || currentQuestionAnswered">
                        {{ t('checkBtn') }}
                    </button>
                </li>


                <li class="lesson-btns" v-if="currentQuestionNum < lessonData?.length">
                    <button class="custom-button-link"  @click="nextQuestion" :disabled="!currentQuestionAnswered">
                        {{ t('nextQBtn') }}
                    </button>
                </li>
            </ul>

            <Modal v-if="store.modalOpen && store.modalType === 'grammar'">
                <GrammarRules :rule="currentQuestion.rule" />
            </Modal>
            <Modal v-if="store.modalOpen && store.modalType === 'report'" @closeCallback="store.setLessonStarted(false)">
                <LessonReport :report="report" :numOfCorrectAnswers="numOfCorrectAnswers" />
            </Modal>
        </template>
    </div>
</template>

<script lang="ts" setup>
import {WordTranslationArrayOfObj, InitData, Question, InitDataArrayOfObj, Report, ReportArrayOfObj, RecordUserAnswerDestructured } from 'types/helperTypes'
import { getLesson, getQuestion, isCorrect } from 'helper/helpers';
import data from 'helper/data';
import { useMainStore } from 'store/main';
const { t } = useI18n({useScope: 'local'})

const props = defineProps({
    lessonType: {
        default: 'all',
        type: String
    },
})

const store = useMainStore();

// lesson menu states
const v_selectedExercise = ref([]) // v-model for selected checkboxes
const selectedExercises = computed<InitDataArrayOfObj>((): InitDataArrayOfObj => {
    return initData.value
        .map((el, i) => v_selectedExercise.value[i] ? el : null)
        .filter(el => el) as InitDataArrayOfObj;
}) // selected exercises full Object (can be more than 1)

const allQuestions = computed<WordTranslationArrayOfObj>((): WordTranslationArrayOfObj => {    
    return selectedExercises.value.map((selected: InitData): WordTranslationArrayOfObj => {
        return selected.data.map(entry => ({...entry, rule: selected.val}));
    }).flat();
}) // allQuestions in 1 array

const numQuestions = computed<number[]>(() => {
    return  [
        allQuestions.value.length >= 5 ? 5 : 0,
        allQuestions.value.length >= 10 ? 10 : 0,
        allQuestions.value.length >= 20 ? 20 : 0,
        allQuestions.value.length >= 30 ? 30 : 0,
        Math.round(allQuestions.value.length / 2),
        allQuestions.value.length
    ]
    .filter(el=>el)
}) // number of questions generated based on how many exersises available

const numQuestionsSelected = ref<number>(0); // num of questions in the lesson selected by user dynamically based on how many questions are available

// const modeSelected = ref<string>('random')
const modeSelected = ref<string>('translationWordMPChoice')


// lesson state
const initData = ref<InitDataArrayOfObj>([] as InitDataArrayOfObj);
const lessonData = ref<WordTranslationArrayOfObj>([]);
const currentQuestionNum = ref<number>(1);
const currentQuestion = ref<Question>({} as Question);
const currentQuestionAnswered = ref<boolean>(false);
const userAnswer = ref<string>('');
const numOfCorrectAnswers = ref<number>(0);
const report = ref<ReportArrayOfObj>([]);

onMounted(() => {
    initData.value = data[props.lessonType];
})

watch(() => store.lessonStarted, (v) => {
    if (v) {
        lessonData.value = getLesson(modeSelected.value, allQuestions.value).slice(0, numQuestionsSelected.value) as WordTranslationArrayOfObj;
        if (lessonData.value && lessonData.value.length) {

            currentQuestion.value = getQuestion(modeSelected.value, lessonData.value, currentQuestionNum.value, props.lessonType);
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


watch(currentQuestionNum, function() {
    if (lessonData.value && lessonData.value.length) {
        currentQuestion.value = getQuestion(modeSelected.value, lessonData.value, currentQuestionNum.value, props.lessonType);
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
        console.log('not correct...');
        currentQuestionAnswered.value = true;
        recordUserAnswer(false, userAnswer.value, currentQuestion.value);
    } else {
        console.log('correct...');
        currentQuestionAnswered.value = true;
        recordUserAnswer(true, userAnswer.value, currentQuestion.value);
        numOfCorrectAnswers.value = numOfCorrectAnswers.value + 1;
    }
};

// recording answers, their correctness for report at the end and updating API.
const recordUserAnswer = (correct: boolean, userAnswer: string, { qAnswer, question, id }:RecordUserAnswerDestructured ):void => {
    const r:Report = {} as Report;
    r.question = question;
    r.userAnswer = userAnswer;
    r.correctAnswer = qAnswer;
    r.id = id;

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

</script>

<style lang="scss">

.learning-data,
.mode,
.number-of-q {
    @apply py-3;
}

.lesson-btns {
    @apply min-w-[175px];

    button {
        @apply mt-3 w-full;
    }
}

.animated-text {
    @apply font-bold whitespace-nowrap w-0 overflow-hidden;
    animation: print 3s steps(25) forwards;
}

@keyframes print {
    from {
        @apply w-0;
    }
    to {
        @apply w-full whitespace-normal;
    }
}

.num-of-q-checkbox {

    .tense-name {
        @apply flex p-2;

    }
    input:checked ~ .tense-name {
        @apply bg-mainGreen text-white;
    }
}
</style>


<i18n lang="yaml">
en:
    selectExercise: 'Select an exercise or multiple exercises:'
    modeTitle: 'Select a learning mode (default is all types)'
    numberQ: 'Select a number of questions:'
    wordTranslation: 'Writing: Translation from English'
    translationWord: 'Writing: Translation to English'
    wordTranslationMPChoice: 'Multiple Choice: Translation from English'
    translationWordMPChoice: 'Multiple Choice: Translation to English'
    sentenceWordTranslation: 'Sentence: Translation from English'
    sentenceTranslationWord: 'Sentence: Translation to English'
    random: 'All'
    startBtn: 'Start'
    questionNumber: 'Question number is {currentQuestionNum} out of {lessonDataLength}'
    question: 'Question:'
    yourAnswer: 'Your answer:'
    clearBtn: 'Clear'
    checkBtn: 'Check'
    nextQBtn: 'Next question'
    rules: 'Rules'
ru:
    selectExercise: 'Выберите упражнение или несколько упражнений:'
    modeTitle: 'Выберите режим обучения (по умолчанию все типы)'
    numberQ: 'Выберите количество вопросов:'
    wordTranslation: 'Написание: Перевод с английского'
    translationWord: 'Написание: Перевод на английский'
    wordTranslationMPChoice: 'Несколько вариантов ответа: Перевод с английского'
    translationWordMPChoice: 'Несколько вариантов ответа: Перевод на английский'
    sentenceWordTranslation: 'Предложение: Перевод с английского'
    sentenceTranslationWord: 'Предложение: Перевод на английский'
    random: 'Все тренировки'
    startBtn: "Начать"
    questionNumber: 'Номер вопроса {currentQuestionNum} из {lessonDataLength}'
    question: 'Вопрос:'
    yourAnswer: 'Ваш ответ:'
    clearBtn: 'Очистить'
    checkBtn: 'Проверить'
    nextQBtn: 'Следующий вопрос'
    rules: 'Правила'
zh:
    selectExercise: 'TBD'
    modeTitle: 'TBD'
    numberQ: '选择问题数量:'
    wordTranslation: '翻译 - 单词'
    translationWord: '单词 - 翻译'
    wordTranslationMPChoice: '多选: 单词 - 翻译'
    translationWordMPChoice: '多选: 翻译 - 单词'
    sentenceWordTranslation: '句子: 单词 - 翻译'
    sentenceTranslationWord: '句子: 翻译 - 单词'
    random: '所有'
    startBtn: "开始"
    questionNumber: '问题编号 {currentQuestionNum} out of {lessonDataLength}'
    question: '问题:'
    yourAnswer: '你的答案:'
    clearBtn: '清除'
    checkBtn: '检查'
    nextQBtn: '下一个问题'
    rules: '规则'
</i18n>