<template>
    <div class="main">
        <div v-if="started">
            <Lesson
                @startLesson="handleLesson"
                :data="filteredData"
                :numQuestions="numQuestions"
                :mode="mode"
            />
        </div>
        <div v-else>
            <div :v-if="filteredData && filteredData.length">
                <RadioButtons
                    @changeMode="handleMode"
                    @changeNumQ="handleQuestionNum"
                    :mode="mode"
                    :numQuestions="numQuestions"
                    :filteredData="filteredData"
                />
            </div>
            <button @click="handleLesson" :disabled="!numQuestions || !mode">Start</button>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex';
import Lesson from '../components/Lesson.vue';
import RadioButtons from '../components/mainMenu/RadioButtons.vue';
import { sentenceBuilderArr, dataBase } from '../helpers/helpers';

export default Vue.extend({
    components: {
        Lesson,
		RadioButtons,
	},
    data() {
        return {
            data: null,
            filteredData: null,
            started: false,
            numQuestions: null,
            mode: null,
        };
    },
    mounted() {
        this.data = dataBase();
        this.filteredData = dataBase();
    },
    methods: {
        ...mapActions({ increment: 'count' }),
        handleLesson() {
            this.started = true;
        },
        handleMode(m) {
            if (m === 'sentenceWordTranslation' || m === 'sentenceTranslationWord') {
                console.log('m', m);
                this.mode = m;
                this.filteredData = sentenceBuilderArr(this.data);
            } else {
                this.mode = m;
                this.filteredData = this.data;
            }
        },
        handleQuestionNum(v) {
            this.numQuestions = v;
        }
    },
    computed: {
		...mapGetters(['count']),
	},
    watch: {
         numQuestions: function() {
            console.log('this.numQuestions', this.numQuestions);
        }
    }
})
</script>


<style lang="scss">

.main {
    @apply bg-yellow-500;
}
</style>
