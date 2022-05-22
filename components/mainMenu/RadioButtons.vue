<template>
    <div>
        <div class="modes">
            <div v-for="(mode, i) in modes" :key="'mode-'+i">
                <label>
                    <input type="radio" name="mode_selection" :value="mode.value" id="" @change="handleMode(mode.value)">
                    <span>{{mode.name}}</span>
                </label>
            </div>
        </div>

        <div class="questions_amount">
            <div v-for="(number, i) in numberOfQ" :key="'number-'+i">
                <label>
                    <input type="radio" name="q_number" :value="number" id="" @change="handleNumberQuestions(number)">
                    <span>{{number}}</span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";

    export default Vue.extend({
        props: [ 'mode', 'numQuestions', 'filteredData' ],
        data() {
            return {
                modes: [
                    { name: 'Word - Translation', value: 'wordTranslation' },
                    { name: 'Translation - Word', value: 'translationWord' },
                    { name: 'Word - Translation Multiple Choice', value: 'wordTranslationMPChoice' },
                    { name: 'Translation - Word Multiple Choice', value: 'translationWordMPChoice' },
                    {
                        name: 'Sentence: Word - Translation',
                        value: 'sentenceWordTranslation',
                    },
                    {
                        name: 'Sentence: Translation - Word',
                        value: 'sentenceTranslationWord',
                    },
                    { name: 'Random', value: 'random' },
                ],
                numberOfQ: null,
            };
        },
        watch: {
            'filteredData.length': function() {
                console.log('filteredData.length changed', this.filteredData.length);
                this.numberOfQ = [
                    this.filteredData.length >= 10 && 10,
                    this.filteredData.length >= 20 && 20,
                    this.filteredData.length >= 30 && 30,
                    Math.round(this.filteredData.length / 2),
                    this.filteredData.length,
                ].filter(el=>el);
            },
            numberOfQ: function() {
                console.log('numberOfQ', this.numberOfQ);
            }
        },
        mounted() {

        },
        methods: {
            handleNumberQuestions(v) {
                this.$emit('changeNumQ', v);
            },
            handleMode(v) {
                this.$emit('changeMode', v);
            }
        }
    });
</script>

<style lang="scss" scoped>

</style>
