<template>
    <ul class="main-menu">
        <li v-if="$route.path !== '/'">
            <BackToHomeBtn />
        </li>
        <li v-if="store.lang">
            <button @click="store.setLang(''), navigateTo('/')">Back to language menu</button>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';

const store = useMainStore();

</script>


