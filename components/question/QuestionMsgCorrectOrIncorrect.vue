<template>
    <div v-if="currentQuestionAnswered">
        <p>{{isCorrect(currentQuestion, userAnswer) ? 'Correct!': `Incorrect, correct answer is: ${currentQuestion.qAnswer}`}}</p>
    </div>
</template>


<script>
import Vue from "vue";
import { isCorrect } from '../../helpers/helpers.js';

export default Vue.extend({
    props: [ 'currentQuestionAnswered', 'currentQuestion', 'userAnswer' ],
    data() {
        return {
            numberOfQ: null,
        };
    },
    watch: {
        numberOfQ: function() {
            console.log('numberOfQ', this.numberOfQ);
        }
    },
    mounted() {

    },
    methods: {

    }
});
</script>

<style lang="scss" scoped>

</style>
