<template>
    <div class="grammar-rules">
        <Tenses v-if="isTenses" :tense="props.rule" :class="props.rule" />
        <IrregularVerbs v-if="props.rule === 'irregularVerbs'" :class="props.rule"/> 
    </div>
</template>

<script lang="ts" setup>
import Tenses from './grammar-rules/Tenses.vue';
import IrregularVerbs from './grammar-rules/IrregularVerbs.vue';

const props = defineProps({
    rule: {
        required: true,
        type: String,
    },
})

const isTenses = computed<boolean>(():boolean => {
    return ['presentSimple', 'presentContinuous', 'presentPerfect', 'pastSimple', 'pastContinuous', 'pastPerfect', 'futureSimple', 'futureContinuous', 'futurePerfect'].includes(props.rule);
});
</script>

<style lang="scss">
    h3,
    h4 {
        @apply text-xl font-bold text-mainGreen mb-3;
    }

    h4 {
        @apply mt-8;
    }

    .grammar-rules {
        ul.grammar-rules--description,
        ul.grammar-rules--specifics,
        ul.grammar-rules--sublist {
            @apply pl-4;
            li {
                @apply relative pb-3;
                counter-increment: listCounter;

                &:before {
                    content: counter(listCounter);
                    @apply absolute -left-4 text-mainGreen text-base font-bold;
                }
            }
        }

        ul.grammar-rules--tensesDataShort {
            li {
                @apply flex flex-col mb-3;
            }
        }

        ul.grammar-rules--sublist {
            @apply pt-3;
            li {
                counter-increment: chapter;
                @apply pb-0;
                &:before {
                    content: counter(chapter, lower-alpha);
                }
            }
        }

        span.green-bolded {
            @apply font-bold text-mainGreen;
        }

        span.green-underlined {
            @apply block font-bold text-mainGreen;
        }
    }
</style>
