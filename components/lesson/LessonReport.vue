<template>
    <div>
        <h2>Results:</h2>
        <ol>
            <li v-for="(q, key, i) of report" :key="i">
                <span>Question: {{q.question}}</span>
                <span :class="q.userAnswer === q.correctAnswer ? 'text-green-500' : 'text-red-500'">My answer: {{q.userAnswer}}</span>
                <span>Correct answer: {{q.correctAnswer}}</span>
            </li>
        </ol>

        <button @click="store.setLessonStarted(false)">Exit lesson</button>
    </div>
</template>

<script setup>
import { useMainStore } from '@/store/main'

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
