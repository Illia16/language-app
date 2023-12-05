<template>
    <div class="lesson-report">
        <h2>{{ t('results')}}: {{numOfCorrectAnswers}}/{{ props.report.length }}</h2>
        <ul class="list-report">
            <li v-for="(q, i) in props.report" :key="`report-${i}`">
                <strong>{{ t('question') }} #{{i+1}}: {{q.question}}</strong>
                <span :class="q.userAnswer === q.correctAnswer ? 'correct-answer' : 'incorrect-answer'">
                    {{ t('myAnswer') }}: {{q.userAnswer}}
                </span>
                <span v-if="!q.isCorrect">{{ t('correctAnswer') }}: {{q.correctAnswer}}</span>
                <span>
                    <span>{{ t('progress') }}:</span>
                    <span>
                        <label class="w-28 flex items-center space-x-1">
                            <progress max="10" :value="q.isCorrect && Number(q.level) < 10 ? Number(q.level)+1 : Number(q.level)"></progress>
                            <span v-if="q.isCorrect && Number(q.level) < 10">{{ (Number(q.level)+1) * 10 }}%</span>
                            <span v-else>{{ Number(q.level) * 10 }}%</span>
                        </label>
                    </span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main'
import { UserDataArrayOfObj, Report } from 'types/helperTypes'
const store = useMainStore()
const config = useRuntimeConfig();
const { t } = useI18n({useScope: 'local'})

const props = defineProps({
    report: {
        required: true,
        type: Array<Report>,
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
    await Promise.all(
        props.report
        .filter((el: Report) => el.isCorrect && Number(el.level) < 10)
        .map(async (el: Report) => {
            const payload = new FormData();
            payload.append('item', el.item);
            payload.append('itemID', el.id);
            payload.append('level', JSON.stringify(Number(el.level) + 1));

            await fetch(`${config.public.apiUrl}/${config.public.envName}/study-items`, {
                method: 'PUT',
                body: payload,
                headers: {
                    "Authorization": `Bearer ${store.token}`
                }
            })
        })
    )
    .then(() => {
        // update FE only after successfull api call
        const newArr: UserDataArrayOfObj = store.userLangData.map(el => {
            const itemLvlToUpdateExists:boolean = props.report
                .filter((el: Report) => el.isCorrect)
                .filter((report:Report) => report.id === el.itemID).length > 0;                
            if (itemLvlToUpdateExists && Number(el.level) < 10) {
                el.level = (Number(el.level) + 1).toString();
                return el;
            } else {
                return el;
            }
        });
        store.setUserLangData(newArr);
    })
}

</script>

<style lang="scss">
    .lesson-report {

        h2 {
            @apply mb-6;
        }

        ul.list-report {
            @apply list-decimal list-inside;
            li {
                @apply list-none flex flex-col;
                
                &:not(:last-child) {
                    @apply mb-6 border-b border-b-black;
                }

                span {
                    @apply flex space-x-2;
                }
            }
        }
    }
</style>

<i18n lang="yaml">
    en:
        results: 'Results'
        question: 'Question'
        myAnswer: 'My answer'
        correctAnswer: 'Correct answer'
        progress: 'Progress'
    ru:
        results: 'Результаты'
        question: 'Вопрос'
        myAnswer: 'Мой ответ'
        correctAnswer: 'Правильный ответ'
        progress: 'Прогресс'
    zh:
        results: 'TBD'
        question: 'TBD'
        myAnswer: 'TBD'
        correctAnswer: 'TBD'
        progress: 'TBD'
</i18n>
    