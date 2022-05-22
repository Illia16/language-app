<template>
    <div v-if="lessonData && lessonData.length && !lessonDone">
        <p>Current question: {{currentQuestionNum}}</p>
        <p>{{currentQuestion.question}}</p>

        <QuestionMsgCorrectOrIncorrect
            :currentQuestionAnswered="currentQuestionAnswered"
            :currentQuestion="currentQuestion"
            :userAnswer="userAnswer"
        />
    </div>
</template>

<script>
    import Vue from "vue";
    import { getLesson, getQuestion, isCorrect } from '../helpers/helpers';
    // Question-related components
    import QuestionMsgCorrectOrIncorrect from './question/QuestionMsgCorrectOrIncorrect';
    // import QuestionTypeRegular from './question/QuestionTypeRegular';
    // import QuestionTypeMpChoice from './question/QuestionTypeMpChoice';
    // import QuestionTypySentenceBuilder from './question/QuestionTypeSentenceBuilder';

    // Lesson-related componets
    // import LessonReport from './LessonReport';

    export default Vue.extend({
        components: {
            QuestionMsgCorrectOrIncorrect,
            // QuestionTypeRegular,
            // QuestionTypeMpChoice,
            // QuestionTypySentenceBuilder
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
            }
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
                    recordUserAnswer(false, this.userAnswer, this.currentQuestion);
                } else {
                    this.currentQuestionAnswered = false;
                    recordUserAnswer(true, userAnswer, currentQuestion);
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
        }
    });
</script>

<style lang="scss" scoped>

</style>
