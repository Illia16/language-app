<template>
    <div class="main">
        <div>Language app!</div>
        <button @click="add">Increment</button>
    </div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
    methods: {
        ...mapActions({ increment: 'count' }),
        add() {
            this.increment(this.count+1);
        }
    },
    computed: {
		...mapGetters(['count']),
	},
    watch: {
         count: function() {
            console.log('this.count', this.count);
        }
    }
})
</script>


<style lang="scss">

.main {
    @apply bg-yellow-500;
}
</style>
