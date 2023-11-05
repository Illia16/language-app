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
import { useMainStore } from 'store/main'
import { ArrayOfUserData, ReportArrayOfObj, Report } from 'types/helperTypes'
const store = useMainStore()
const config = useRuntimeConfig();

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

onMounted(() => {
    console.log('props', props.report);
    updateUserData();
})

onBeforeUnmount(() => {
    store.setLessonStarted(false)
})

// PUT API (update level for correct answers)
const updateUserData = async () => {
    const payload = props.report
    .filter((el: Report) => el.isCorrect && Number(el.level) < 10)
    .map((el: Report) => {
        return  {
            "user": store.currentUserName,
            "itemID": el.id,
            "keyToUpdate": {
                "name": 'level',
                "value": JSON.stringify(Number(el.level) + 1), 
            }
        }
    })

    const res = await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items?user=${store.currentUserName}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    })
    .then(res => res.json())

    // update FE
    const newArr: ArrayOfUserData = store.userLangData.map(el => {
        const itemLvlToUpdateExists:boolean = props.report.filter((report:Report) => report.id === el.itemID).length > 0
        if (itemLvlToUpdateExists && Number(el.level) < 10) {
            el.level = (Number(el.level) + 1).toString();
            return el;
        } else {
            return el;
        }
    });
    store.setUserLangData(newArr);
}

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
