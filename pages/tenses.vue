<template>
  <div>
    <NuxtLink to="/">Back to homepage</NuxtLink>
    <div>
        <Lesson lessonType="tenses" />
    </div>
  </div>
</template>

<style lang="scss">
    .mode-radio,
    .num-of-q-checkbox,
    .tense-checkbox {
        @apply my-7;
        label {
            @apply relative;

            input {
                ~ .radio-bg,
                ~ .checkbox-bg {
                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 20px;
                        height: 20px;
                        border: 1px solid #000;
                        background: #fff;
                    }

                    &::after {
                        content: '';
                        width: 14px;
                        height: 14px;
                        background: #000;
                        position: absolute;
                        top: 3px;
                        left: 3px;
                        -webkit-transition: all 0.2s ease;
                        transition: all 0.2s ease;
                        opacity: 0;
                    }
                }

                &:checked {
                    ~ .radio-bg,
                    ~ .checkbox-bg {
                        &::after {
                            @apply opacity-100
                        }
                    }
                }
            }

            .input-name {
                @apply pl-7;
            }
        }
    }

    .mode-radio,
    .num-of-q-checkbox {
        label {
            input {
                ~ .radio-bg,
                ~ .checkbox-bg {
                    &::before,
                    &::after {
                        @apply rounded-full;
                    }
                }
            }
        }
    }

    button {
        @apply px-6 py-1 border border-black;
        &:disabled {
            @apply text-gray-400 border-gray-400;
        }
    }
</style>
