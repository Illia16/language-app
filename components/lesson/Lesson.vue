<template>
    <div>
        <div v-if="lessonType === 'all'">
            All options for a lesson
        </div>

        <div v-if="lessonType === 'tenses'">
            <div v-if="!store.lessonStarted">
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

            <div v-if="store.lessonStarted">
                <div v-if="currentQuestionAnswered">
                    <p v-if="isCorrect(currentQuestion, userAnswer)" class="text-green-500">Correct!</p>
                    <p v-if="!isCorrect(currentQuestion, userAnswer)" class="text-red-500">Incorrect, correct answer is: {{currentQuestion?.qAnswer}}</p>
                </div>

                <div>
                    <div>Question number is {{currentQuestionNum}} out of {{lessonData?.length}}</div>
                    <div>Question: {{currentQuestion.question}}</div>
                    <div>Your answer: {{userAnswer}}</div>


                    <!--MODE: Write text -->
                    <div class="my-3" v-if="currentQuestion.mode === 'wordTranslation' || currentQuestion.mode === 'translationWord'">
                        <label>
                            <input type="text" v-model="userAnswer" class="border border-black p-1" />
                        </label>
                    </div>

                    <!--MODE: Multiple Choice -->
                    <div class="my-3" v-if="currentQuestion.mode === 'wordTranslationMPChoice' || currentQuestion.mode === 'translationWordMPChoice'">
                        <div v-for="(q, key, i) of currentQuestion.all" :key="i" class="num-of-q-checkbox" tabindex="0">
                            <label class="p-2 border border-black">
                                <input
                                    tabindex="-1"
                                    class="sr-only"
                                    type="radio"
                                    name="number-of-q"
                                    @change="userAnswer = q"
                                />
                                <span class="tense-checkbox-bg"></span>
                                <span class="tense-name">{{q}}</span>
                            </label>
                        </div>
                    </div>

                    <!--MODE: Sentence Builer -->
                    <div class="my-3" v-if="currentQuestion.mode === 'sentenceWordTranslation' || currentQuestion.mode === 'sentenceTranslationWord'">
                        <div>
                            <button @click="userAnswer = ''" :disabled="!userAnswer || currentQuestionAnswered">Clear</button>
                        </div>
                        <button
                            @click="userAnswer ? userAnswer = userAnswer + ' ' + word : userAnswer = word"
                            v-for="(word, key, i) of currentQuestion.splitted"
                            :key="i"
                            class="mx-2"
                            :disabled="currentQuestionAnswered">
                            {{word}}
                        </button>
                    </div>
                </div>

                <div class="lesson-btns">
                    <button @click="check" :disabled="!userAnswer || currentQuestionAnswered">
                        Check
                    </button>
                </div>

                <div class="lesson-btns">
                    <button v-if="currentQuestionNum < lessonData?.length" @click="nextQuestion" :disabled="!currentQuestionAnswered">
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

<script setup>
import { getLesson, getQuestion, isCorrect } from '@/helper/helpers';
import { tensesData } from 'helper/tensesData';
import { useMainStore } from '@/store/main';

const props = defineProps({
    lessonType: {
        default: 'all',
        type: String
    },
})

const store = useMainStore();

// lesson menu states
const v_selectedTenses = ref([]) // v-model for selected checkboxes
const selectedTenses = computed(() => tensesData.map((el, i) => v_selectedTenses.value[i] ? el : null).filter(el => el)) // selected tenses full Object (can be more than 1)
const allQuestions = computed(() => selectedTenses.value.map((el, i) => el.data).flat()) // allQuestions in 1 array
const numQuestions = computed(() => [allQuestions.value.length >= 10 && 10, allQuestions.value.length >= 20 && 20, allQuestions.value.length >= 30 && 30, Math.round(allQuestions.value.length / 2), allQuestions.value.length].filter(el=>el)) // number of questions generated based on how many exersises available
const numQuestionsSelected = ref(5) // selected num of questions by user
const modeSelected = ref('random')

// lesson state
const lessonData = ref([]);
const currentQuestionNum = ref(1);
const currentQuestion = ref({});
const currentQuestionAnswered = ref(false);
const userAnswer = ref();
const numOfCorrectAnswers = ref(0);
const report = ref([]);


watch(() => store.lessonStarted, (v) => {
    if (v) {
        lessonData.value = getLesson(modeSelected.value, allQuestions.value).slice(0, numQuestionsSelected.value);
        if (lessonData.value && lessonData.value.length) {
            currentQuestion.value = getQuestion(modeSelected.value, lessonData.value, currentQuestionNum.value);
        }
    } else {
        lessonData.value = [];
        currentQuestionNum.value = 1;
        currentQuestion.value = {};
        currentQuestionAnswered.value = false;
        userAnswer.value = ''
        numOfCorrectAnswers.value = 0;
        report.value = [];
    }
});


watch(currentQuestionNum, function() {
    if (lessonData.value && lessonData.value.length) {
        currentQuestion.value = getQuestion(modeSelected.value, lessonData.value, currentQuestionNum.value);
    }
});


// handling incorrect, correct answers and if no more questions, stopping the lesson
const check = () => {
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
const recordUserAnswer = (correct, userAnswer, { qAnswer, question, id }) => {
    const r = {};
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

const nextQuestion = () => {
    currentQuestionNum.value = currentQuestionNum.value + 1;
    currentQuestionAnswered.value = false;
    userAnswer.value = '';
};

const mapModeNames = (v) => {
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
.lesson-btns {
    @apply text-center;

    button {
        @apply mt-3 min-w-[175px];
    }
}
</style>
