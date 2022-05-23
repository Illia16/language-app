<template>
    <div v-if="currentQuestionAnswered">
        <p>{{correct ? 'Correct!': `Incorrect, correct answer is: ${currentQuestion.qAnswer}`}}</p>
    </div>
</template>


<script>
import Vue from "vue";
import { isCorrect } from '../../helpers/helpers.js';

export default Vue.extend({
    props: [ 'currentQuestionAnswered', 'currentQuestion', 'userAnswer' ],
    data() {
        return {
            correct: null,
        };
    },
    watch: {
        currentQuestionAnswered: function() {
            return isCorrect(this.currentQuestion, this.userAnswer) ? this.correct = true : this.correct = false;
        }
    },
});
</script>

<style lang="scss" scoped>

</style>
