<template>
    <div>
        <div v-if="lessonType === 'all'">
            All options for a lesson
        </div>

        <div v-if="lessonType === 'tenses'">
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
</template>

<script>
import { getLesson, getQuestion, isCorrect } from '@/helper/helpers';
import { useMainStore } from '@/store/main'

export default {
    name: 'Lesson',
    props: {
        lessonType: {
            default: 'all',
            type: String
        },
        selectedData: {
            required: true,
            type: Object
        },
        selectedDataQuestions: {
            required: true,
            type: Array
        },
        numQuestions: {
            required: false,
            type: Number,
            default: 5
        },
        mode: {
            required: false,
            type: String,
            validator(v) {
                return ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord', 'random'].includes(v);
            },
            default: 'random'
        }
    },
    setup() {
        const store = useMainStore()

        return { store, isCorrect }
    },
    data() {
        return {
            lessonData: null,
            currentQuestionNum: 1,
            currentQuestion: '',
            currentQuestionAnswered: false,
            userAnswer: '',
            numOfCorrectAnswers: 0,
            report: '',
        }
    },
    mounted() {
        this.lessonData = getLesson(this.mode, this.selectedDataQuestions).slice(0, this.numQuestions);
        if (this.lessonData && this.lessonData.length) {
			this.currentQuestion = getQuestion(this.mode, this.lessonData, this.currentQuestionNum);
		}
    },
    methods: {
        // handling incorrect, correct answers and if no more questions, stopping the lesson
        check() {
            console.log('checking...');
            if (!isCorrect(this.currentQuestion, this.userAnswer)) {
                console.log('not correct...');
                this.currentQuestionAnswered = true;
                this.recordUserAnswer(false, this.userAnswer, this.currentQuestion);
            } else {
                console.log('correct...');
                this.currentQuestionAnswered = true;
                this.recordUserAnswer(true, this.userAnswer, this.currentQuestion);
                this.numOfCorrectAnswers = this.numOfCorrectAnswers + 1;
            }
        },
        // recording answers, their correctness for report at the end and updating API.
        recordUserAnswer(correct, userAnswer, { qAnswer, question, id }) {
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

            this.report = [...this.report, r];
        },
        nextQuestion() {
            this.currentQuestionNum = this.currentQuestionNum + 1;
            this.currentQuestionAnswered = false;
            this.userAnswer = '';
        },
    },
    watch: {
        currentQuestionNum() {
            if (this.lessonData && this.lessonData.length) {
                this.currentQuestion = getQuestion(this.mode, this.lessonData, this.currentQuestionNum);
            }
        }
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
