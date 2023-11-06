<template>
  <div class="page-error">
    <h1>{{ error?.statusCode }}</h1>
    <h2>{{ error?.message }}</h2>
    <button @click="handleError">{{ t('goBackToHomepage') }}</button>
  </div>
</template>

<script setup lang="ts">
    const { t } = useI18n();
    const props = defineProps({
        error: Object
    })

    const handleError = () => clearError({ redirect: '/' })
    console.log('props', props.error);
    
</script>

<style lang="scss" scoped>
    .page-error {
        @apply min-h-screen bg-[#ffe6a5] flex flex-col items-center justify-center space-y-8;

        h1 {
            @apply font-black text-7xl;
        }

        button {
            @apply bg-mainGreen text-2xl text-white py-2 px-3 border-2 border-transparent;

            &:hover,
            &:focus {
                @apply bg-transparent text-black border-2 border-mainGreen;
            }
        }
    }
</style>


<i18n lang="yaml">
    en:
        goBackToHomepage: 'Go to the homepage'
    ru:
        goBackToHomepage: 'На домашнюю страницу'
    zh:
        goBackToHomepage: 'TBD'
</i18n>
