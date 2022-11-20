<template>
    <div class="language-app-site">
        <MainMenu />
        <NuxtPage />
    </div>
</template>


<script setup>

</script>

<style lang="scss">
    .language-app-site {
        margin: 10vh 15vw;
        p {
            // @apply text-red-400;

            &.specialP {
                @apply text-yellow-600;
            }
        }
    }
</style>
