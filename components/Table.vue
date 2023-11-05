<template>
    <ul class="table">
        <slot></slot>
    </ul>
</template>

<script lang="ts" setup>
</script>

<style lang="scss">
    ul.table {
        @apply w-full;
        > li {
            > ul {
                @apply text-center flex;

                li {
                    @apply flex flex-col items-center justify-center;
                }
            }

            &:nth-child(odd) {
                li {
                    @apply border-t-mainGreen border-t-2 border-b-mainGreen border-b-2 border-l-2 border-l-mainGreen flex-1;

                    &:last-child {
                        @apply border-r-mainGreen border-r-2;
                    }
                }
            }

            &:nth-child(even) {
                li {
                    @apply border-l-mainGreen border-l-2 flex-1;

                    &:last-child {
                        @apply border-r-mainGreen border-r-2;
                    }
                }
            }

            &:last-child {
                li {
                    @apply border-b-mainGreen border-b-2;
                }
            }
        }

        &.grammar-table {
            > li {
                li {
                    @apply min-w-[70px] text-xs p-2;
                }
            }
        }

        &.irregular-verbs-table {
            > li {
                li {
                    @apply text-[11px];
                }
            }
        }
    }
</style>