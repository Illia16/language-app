<template>
    <section>
        <h3>Results:</h3>
        <ul>
            <li v-for="(item, i) in report" :key="'report'+item+'_'+i">
                <span>
                    Question: {{item.question}}
                    My answer: {{item.userAnswer}}
                    Correct answer: {{item.correctAnswer}}
                </span>
            </li>
        </ul>

        <button @click="handleLesson(false)">Back to menu</button>
    </section>
</template>


<script>
import Vue from "vue";
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
    props: [ 'report' ],
    methods: {
        ...mapActions({ setStarted: 'started' }),
        handleLesson(v) {
            this.setStarted(v);
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
