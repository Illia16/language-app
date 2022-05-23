<template>
    <div class="question_regular">
        <label>
            <input type="text" name="" :value="userAnswer" placeholder='enter here' id="" :disabled="currentQuestionAnswered" @change="(e) => setUserAnswer(e.target.value)">
        </label>
    </div>
</template>


<script>
import Vue from "vue";

export default Vue.extend({
    props: [ 'userAnswer', 'currentQuestionAnswered' ],
    methods: {
        setUserAnswer(v) {
            this.$emit('handleUserAnswer', v);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
