<template>
    <div class="language-app-site">
        <MainMenu />
        <NuxtPage />
    </div>
</template>

<style lang="scss">
    .language-app-site {
        @apply flex flex-col items-center min-h-screen bg-amber-200 px-5 py-4;

        p {
            &.specialP {
                @apply text-yellow-600;
            }
        }
    }
</style>
