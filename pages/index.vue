<template>
    <div class="main">
        <div v-if="this.started">
            <Lesson
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
            <button @click="handleLesson(true)" :disabled="!numQuestions || !mode">Start</button>
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
            numQuestions: null,
            mode: null,
        };
    },
    mounted() {
        this.data = dataBase();
        this.filteredData = dataBase();
    },
    methods: {
        ...mapActions({ setStarted: 'started' }),
        handleLesson(v) {
            this.setStarted(v);
        },
        handleMode(m) {
            if (m === 'sentenceWordTranslation' || m === 'sentenceTranslationWord') {
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
		...mapGetters(['started']),
	},
    watch: {
        numQuestions: function() {
        },
        started: function() {
            if (!this.started) {
                this.numQuestions = null;
                this.mode = null;
            }
        }
    }
})
</script>


<style lang="scss">

.main {
    @apply bg-yellow-500;
}
</style>
