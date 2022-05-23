<template>
    <div class="question_sentance_build">
        <p>Answer: {{userAnswer}}</p>
        <button @click="() => setUserAnswer('')" :disabled="currentQuestionAnswered">Clear</button>

        <div v-for="(letter, i) in currentQuestion.splitted" :key="'q-sentence-builder-'+i">
            <button @click="setUserAnswer(letter)">
                <span>{{letter}}</span>
            </button>
        </div>
    </div>
</template>


<script>
import Vue from "vue";

export default Vue.extend({
    props: [ 'userAnswer', 'currentQuestion', 'currentQuestionAnswered' ],
    methods: {
        setUserAnswer(v) {
            this.$emit('handleUserAnswer', this.userAnswer ? this.userAnswer + v : v);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
