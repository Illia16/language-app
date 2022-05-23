<template>
    <div>
        <div v-if="lessonData && lessonData.length && !lessonDone">
            <p>Current question: {{currentQuestionNum}}</p>
            <p>{{currentQuestion.question}}</p>

            <QuestionMsgCorrectOrIncorrect
                :currentQuestionAnswered="currentQuestionAnswered"
                :currentQuestion="currentQuestion"
                :userAnswer="userAnswer"
            />

            <!-- handling question based on the mode -->
            <QuestionTypeMpChoice
                v-if="currentQuestion.all && currentQuestion.all.length"
                @handleUserAnswer="setUserAnswer"
                :userAnswer="userAnswer"
                :currentQuestion="currentQuestion"
                :currentQuestionAnswered="currentQuestionAnswered"
            />

            <QuestionTypySentenceBuilder
                v-if="currentQuestion.splitted && currentQuestion.splitted.length"
                @handleUserAnswer="setUserAnswer"
                :userAnswer="userAnswer"
                :currentQuestion="currentQuestion"
                :currentQuestionAnswered="currentQuestionAnswered"
            />

            <QuestionTypeRegular
                v-if="!currentQuestion.splitted && !currentQuestion.all"
                @handleUserAnswer="setUserAnswer"
                :userAnswer="userAnswer"
                :currentQuestionAnswered="currentQuestionAnswered"
            />

            <button @click="check" :disabled="!userAnswer">Check</button>
            <button
                v-if="!lessonDone"
                @click="nextQuestion"
                :disabled="!currentQuestionAnswered">
                Next question
            </Button>
        </div>
        <div v-else-if="lessonDone">
            <Report :report="report" />
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import { getLesson, getQuestion, isCorrect } from '../helpers/helpers';
    // Question-related components
    import QuestionMsgCorrectOrIncorrect from './question/QuestionMsgCorrectOrIncorrect';
    import QuestionTypeRegular from './question/QuestionTypeRegular';
    import QuestionTypeMpChoice from './question/QuestionTypeMpChoice';
    import QuestionTypySentenceBuilder from './question/QuestionTypeSentenceBuilder';

    // Lesson-related componets
    import Report from './Report';

    export default Vue.extend({
        components: {
            QuestionMsgCorrectOrIncorrect,
            QuestionTypeRegular,
            QuestionTypeMpChoice,
            QuestionTypySentenceBuilder,
            Report
        },
        props: [ 'data', 'numQuestions', 'mode' ],
        data() {
            return {
                lessonData: null,
                currentQuestionNum: 1,
                currentQuestion: {},
                currentQuestionAnswered: false,
                userAnswer: null,
                numOfCorrectAnswers: 0,
                report: [],
                lessonDone: null,
            };
        },
        watch: {
            currentQuestionNum: function() {
                if (this.lessonData && this.lessonData.length) {
                    this.currentQuestion = getQuestion(this.mode, this.lessonData, this.currentQuestionNum);
                }
            },
        },
        mounted() {
            this.lessonData = getLesson(this.mode, this.data).slice(0, this.numQuestions);

            if (this.lessonData && this.lessonData.length) {
                this.currentQuestion = getQuestion(this.mode, this.lessonData, this.currentQuestionNum);
            }
        },
        methods: {
            check() {
                if (!isCorrect(this.currentQuestion, this.userAnswer)) {
                    this.currentQuestionAnswered = true;
                    this.recordUserAnswer(false, this.userAnswer, this.currentQuestion);
                } else {
                    this.currentQuestionAnswered = true;
                    this.recordUserAnswer(true, this.userAnswer, this.currentQuestion);
                    this.numOfCorrectAnswers = this.numOfCorrectAnswers + 1;
                }

                if (this.lessonData.length <= this.currentQuestionNum) {
                    this.lessonDone = true;
                }
            },
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
            handleNumberQuestions(v) {
                this.$emit('changeNumQ', v);
            },
            handleMode(v) {
                this.$emit('changeMode', v);
            },
            setUserAnswer(v) {
                this.userAnswer = v;
            }
        }
    });
</script>

<style lang="scss" scoped>

</style>
