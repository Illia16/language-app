<template>
    <div class="question_mp_choice">
        <div v-for="(question, i) in currentQuestion.all" :key="'q_mp_choice-'+i">
            <label>
                <input type="radio" name="q_mp_choice" :value="question" id="" @change="setUserAnswer(question)">
                <span>{{question}}</span>
            </label>
        </div>
    </div>
</template>


<script>
import Vue from "vue";

export default Vue.extend({
    props: [ 'userAnswer', 'currentQuestion', 'currentQuestionAnswered' ],
    methods: {
        setUserAnswer(v) {
            this.$emit('handleUserAnswer', v);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
