<template>
    <NuxtLink :to="localePath('/')">{{ t('goToHome') }}</NuxtLink>
</template>


<script lang="ts" setup>
const localePath = useLocalePath()
const { t } = useI18n({
  useScope: 'local'
})
</script>

<i18n lang="yaml">
en:
    goToHome: 'Back to homepage'
ru:
    goToHome: 'На домашнюю страницу'
zh:
    goToHome: '返回首页'
</i18n>
