<template>
    <div>
        <h2>{{ t('selectTask') }}</h2>
        <ul class="list-items">
            <li v-for="(task, i) of ['tenses', 'words', 'modal-verbs']" :key="task+i">
                <NuxtLink :to="localePath({ name: task })" class="custom-button-link">{{ t(task) }}</NuxtLink>
            </li>
        </ul>
    </div>
</template>


<script lang="ts" setup>
const { t } = useI18n()
const localePath = useLocalePath()
</script>
