<template>
    <h1>{{ t('selectTask') }}</h1>
    <ul class="list-items">
        <li v-for="(task, i) of ['tenses', 'words', 'modal-verbs']" :key="task+i">
            <NuxtLink :to="localePath({ name: task })" class="custom-button-link">{{ t(task) }}</NuxtLink>
        </li>
    </ul>
</template>


<script lang="ts" setup>
const { t } = useI18n()
const localePath = useLocalePath()
</script>