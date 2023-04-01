<template>
    <div>
        <div v-if="lessonType === 'all'">
            All options for a lesson
        </div>

        <div>
            <div v-if="!store.lessonStarted">
                <!-- TENSES -->
                <div v-if="initData && initData.length && !store.lessonStarted">
                    <h2>Select an exersise or multiple exersises:</h2>
                    <div v-for="(tense, i) of initData" :key="i" class="tense-checkbox" tabindex="0">
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
                            <div v-for="(number, key) of numQuestions" :key="`number-of-q-key-${key}`" class="num-of-q-checkbox" tabindex="0">
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
                        <div v-for="(mode, i) of lessonType === 'words' ? ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'random'] : ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord', 'random']" :key="i" class="mode-radio" tabindex="0">
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

                    <button class="custom-button-link" @click="store.setLessonStarted(true)" :disabled="selectedTenses.every(el => !el)">
                        Start
                    </button>
                </div>
            </div>

            <div v-if="store.lessonStarted">
                <div class="min-h-[65px]">
                    <div v-if="currentQuestionAnswered">
                        <p v-if="isCorrect(currentQuestion, userAnswer)" class="correct-answer">Correct!</p>
                        <p v-if="!isCorrect(currentQuestion, userAnswer)" class="incorrect-answer">Incorrect, correct answer is: {{currentQuestion?.qAnswer}}</p>
                    </div>
                </div>

                <div>
                    <div>Question number is {{currentQuestionNum}} out of {{lessonData?.length}}</div>
                    <div class="font-bold">Question: {{currentQuestion.question}}</div>
                    <div class="min-h-[50px] break-all">Your answer: {{userAnswer}}</div>


                    <!--MODE: Write text -->
                    <div class="my-3" v-if="currentQuestion.mode === 'wordTranslation' || currentQuestion.mode === 'translationWord'">
                        <label>
                            <input type="text" v-model="userAnswer" class="border border-black p-1" />
                        </label>
                    </div>

                    <!--MODE: Multiple Choice -->
                    <div class="my-3" v-if="currentQuestion.mode === 'wordTranslationMPChoice' || currentQuestion.mode === 'translationWordMPChoice'">
                        <div v-for="(q, key) of currentQuestion.all" :key="`mp-choice-q-key-${key}`" class="num-of-q-checkbox" tabindex="0">
                            <label :class="[`p-2 border border-black ${currentQuestionAnswered && 'opacity-25'}`]">
                                <input
                                    tabindex="-1"
                                    class="sr-only"
                                    type="radio"
                                    name="number-of-q"
                                    @click="userAnswer = q"
                                    :disabled="currentQuestionAnswered"
                                />
                                <span class="tense-checkbox-bg"></span>
                                <span class="tense-name">{{q}}</span>
                            </label>
                        </div>
                    </div>

                    <!--MODE: Sentence Builer -->
                    <div v-if="lessonType !== 'words' && (currentQuestion.mode === 'sentenceWordTranslation' || currentQuestion.mode === 'sentenceTranslationWord')">
                        <div class="my-3">
                            <button class="custom-button-link" @click="userAnswer = ''" :disabled="!userAnswer || currentQuestionAnswered">Clear</button>
                        </div>
                        <div class="my-5 flex flex-wrap">
                            <button
                                @click="userAnswer ? userAnswer = userAnswer + ' ' + word : userAnswer = word"
                                v-for="(word, key) of currentQuestion.splitted"
                                :key="`sentence-builer-q-key-${key}`"
                                class="custom-button-link custom-button-link--mp-choice"
                                :disabled="currentQuestionAnswered">
                                {{word}}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lesson-btns">
                    <button class="custom-button-link" @click="check" :disabled="!userAnswer || currentQuestionAnswered">
                        Check
                    </button>
                </div>

                <div class="lesson-btns">
                    <button class="custom-button-link" v-if="currentQuestionNum < lessonData?.length" @click="nextQuestion" :disabled="!currentQuestionAnswered">
                        Next Question
                    </button>
                </div>

                <div v-if="lessonData?.length === currentQuestionNum && currentQuestionAnswered">
                    <LessonReport :report="report" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {WordTranslationArrayOfObj, InitData, Question, InitDataArrayOfObj, Report, ReportArrayOfObj, RecordUserAnswerDestructured } from 'types/helperTypes'
import { getLesson, getQuestion, isCorrect, mapModeNames } from 'helper/helpers';
import data from 'helper/data';
import { useMainStore } from 'store/main';

const props = defineProps({
    lessonType: {
        default: 'all',
        type: String
    },
})

const store = useMainStore();

// lesson menu states
const v_selectedTenses = ref([]) // v-model for selected checkboxes
const selectedTenses = computed<InitDataArrayOfObj>((): InitDataArrayOfObj => {
    return initData.value
        .map((el, i) => v_selectedTenses.value[i] ? el : null)
        .filter(el => el) as InitDataArrayOfObj;
}) // selected tenses/words full Object (can be more than 1)

const allQuestions = computed<WordTranslationArrayOfObj>((): WordTranslationArrayOfObj => {
    return selectedTenses.value.map((el: InitData): WordTranslationArrayOfObj => {
        return el.data;
    }).flat();
}) // allQuestions in 1 array

const numQuestions = computed<number[]>(() => {
    return  [
        allQuestions.value.length >= 10 ? 10 : 0, 
        allQuestions.value.length >= 20 ? 20 : 0, 
        allQuestions.value.length >= 30 ? 30 : 0, 
        Math.round(allQuestions.value.length / 2), 
        allQuestions.value.length
    ]
    .filter(el=>el)
}) // number of questions generated based on how many exersises available

const numQuestionsSelected = ref<number>(5) // selected num of questions by user
const modeSelected = ref<string>('random')

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


// handling incorrect, correct answers and if no more questions, stopping the lesson
const check = ():void => {
    console.log('checking...');
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
.lesson-btns {
    @apply min-w-[175px];

    button {
        @apply mt-3 w-full;
    }
}
</style>
