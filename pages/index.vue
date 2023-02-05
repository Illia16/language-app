<template>
    <div class="main-page">
        <div>
            <h1>Select a task:</h1>
        </div>
        <NuxtLink to="/tenses" class="custom-button-link">Tenses (времена)</NuxtLink>
        <NuxtLink to="/words" class="custom-button-link">Words (слова)</NuxtLink>
    </div>
</template>


<style lang="scss">
    .main-page {
        @apply flex flex-col items-center space-y-5;

        h1 {
            @apply text-4xl mb-5;
        }
    }
</style>

