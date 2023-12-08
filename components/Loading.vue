<template>
    <teleport to="body">
        <div class="loading-container">
            <div class="loading-shadow"></div>
            <span class="loading"></span>
        </div>
    </teleport>
</template>


<style lang="scss">

.loading-container {
    @apply fixed;

    .loading-shadow {
        @apply fixed bg-white opacity-80 inset-0 z-[5];
    }
    
    .loading {
        @apply fixed w-12 h-12 z-10 left-[calc(100vw/2-3rem/2)] top-[calc(100vh/2-3rem/2)] border-4 border-solid border-mainGreen border-b-transparent rounded-full inline-block;
        animation: loadingAnimation 1.25s linear infinite;
    }
}

@keyframes loadingAnimation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
