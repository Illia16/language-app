<template>
    <div>
        <h2>Results: {{numOfCorrectAnswers}}/{{ props.report.length }}</h2>
        <ul class="list-report">
            
            <li v-for="(q, i) in props.report" :key="`report-${i}`">
                <span>Question: #{{i+1}} {{q.question}}</span>
                <span :class="q.userAnswer === q.correctAnswer ? 'correct-answer' : 'incorrect-answer'">My answer: {{q.userAnswer}}</span>
                <span v-if="!q.isCorrect">Correct answer: {{q.correctAnswer}}</span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps({
    report: {
        required: true,
        type: Object,
    },
    numOfCorrectAnswers: {
        required: true,
        type: Number,
    }
})

</script>

<style lang="scss">
    ul.list-report {
        @apply list-decimal list-inside;
        li {
            @apply border-b border-b-black my-3 list-none;

            span {
                @apply block;
            }
        }
    }
</style>
