<template>
    <div class="grammar-rules">
        <PresentSimple v-if="props.rule === 'presentSimple'" :class="props.rule" />
        <PresentContinuous v-if="props.rule === 'presentContinuous'" :class="props.rule" />
        <PresentPerfect v-if="props.rule === 'presentPerfect'" :class="props.rule"/>
    </div>
</template>

<script lang="ts" setup>
import PresentSimple from './grammar-rules/PresentSimple.vue';
import PresentContinuous from './grammar-rules/PresentContinuous.vue';
import PresentPerfect from './grammar-rules/PresentPerfect.vue';

const props = defineProps({
    rule: {
        required: true,
        type: String,
    },
})
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
