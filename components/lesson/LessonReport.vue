<template>
    <div>
        <h2>Results:</h2>
        <ol>
            <li v-for="(q, key) of props.report" :key="`report-${key}`">
                <span>Question: {{q.question}}</span>
                <span :class="q.userAnswer === q.correctAnswer ? 'correct-answer' : 'incorrect-answer'">My answer: {{q.userAnswer}}</span>
                <span>Correct answer: {{q.correctAnswer}}</span>
            </li>
        </ol>

        <button class="custom-button-link" @click="store.setLessonStarted(false)">Exit lesson</button>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main'

const props = defineProps({
    report: {
        required: true,
        type: Object,
    }
})

const store = useMainStore()

</script>

<style lang="scss">
    ol {
        @apply list-decimal list-inside;
        li {
            @apply border-b border-b-black my-3;

            span {
                @apply block;
            }
        }
    }
</style>
