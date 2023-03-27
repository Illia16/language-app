<template>
    <div class="main-page">
        <div v-if="!store.lang" id="user_language">
            <h2>Select your mother tongue</h2>
            <div v-for="(user_language, i) of ['en', 'ru', 'cn']" :key="i" class="user_language-radio" tabindex="0">
                <label>
                    <input
                    tabindex="-1"
                    class="sr-only"
                    type="radio"
                    name="user_language"
                    @change="store.setLang(user_language)"
                        />
                    <span class="radio-bg"></span>
                    <span class="input-name">{{user_language}}</span>
                </label>
            </div>
        </div>

        <template v-if="store.lang">
            <div>
                <h1>Select a task:</h1>
            </div>
            <NuxtLink to="/tenses" class="custom-button-link">Tenses (времена)</NuxtLink>
            <NuxtLink to="/words" class="custom-button-link">Words (слова)</NuxtLink>
        </template>
    </div>
</template>

<script setup>
import { useMainStore } from '@/store/main';
const store = useMainStore();
</script>


<style lang="scss">
    .main-page {
        @apply flex flex-col items-center space-y-5;

        h1 {
            @apply text-4xl mb-5;
        }
    }
</style>

