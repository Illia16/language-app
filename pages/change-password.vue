<template>
    <ChangePassword  @pwChangedSuccess="pwChangedSuccessCallback"/>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';

const store = useMainStore();
const route = useRoute()
const {locale, setLocale } = useI18n({
  useScope: 'local'
})

useHead({
    title: 'Language App',
    htmlAttrs: {
        lang: locale,
    }
})

onMounted(() => {
    setLocale(route.query.userMotherTongue);
    store.setCurrentUserId(route.query.userId);
    store.setToken(route.query.token);
})

const pwChangedSuccessCallback = () => {
    navigateTo('/');
}

</script>