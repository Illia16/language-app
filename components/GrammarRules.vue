<template>
    <div class="grammar-rules">
        <PresentSimple v-if="props.rule === 'presentSimple'" :class="props.rule" />
        <PresentContinuous v-if="props.rule === 'presentContinuous'" :class="props.rule" />
        <!-- <PresentPerfect v-if="props.rule === 'presentPerfect'" /> -->
    </div>
</template>

<script lang="ts" setup>
import PresentSimple from './grammar-rules/PresentSimple.vue';
import PresentContinuous from './grammar-rules/PresentContinuous.vue';

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
        @apply text-xl font-bold text-mainGreen underline;
    }
    .grammar-rules {
        ul.grammar-rules--description {
            @apply pl-4;
            li {
                @apply relative py-3;

                &:before {
                    content: '•';
                    @apply absolute -left-4 text-mainGreen text-base font-bold;
                }
            }
        }

        ul.grammar-rules--specifics {
            @apply pl-4;
            li {
                @apply relative py-3;
                counter-increment: listCounter;

                &:before {
                    content: counter(listCounter);
                    @apply absolute -left-4 text-mainGreen text-base font-bold;
                }
            }
        }
        
        ul.grammar-rules--how-to-build {
            @apply pl-4;
            li {
                @apply relative py-3;
                counter-increment: listCounter;

                &:before {
                    content: counter(listCounter);
                    @apply absolute -left-4 text-mainGreen text-base font-bold;
                }
            }
        }

        ul.grammar-rules--examples {
            > li {
                @apply py-3;

                ul {
                    @apply pl-4;

                    li {
                        @apply relative;
                        counter-increment: listCounter;
                        &:before {
                            content: counter(listCounter);
                            @apply absolute -left-4 text-mainGreen text-base font-bold;
                        }
                    }
                }
            }
        }

        span.green-bolded {
            @apply font-bold text-mainGreen; 
        }

        span.green-underlined {
            @apply font-bold text-mainGreen underline; 
        }
    }
</style>
