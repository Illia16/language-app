<template>
  <div>
    <NuxtLink to="/">Back to homepage</NuxtLink>
    <div>Words...</div>
  </div>
</template>

<script setup>
import { wordsData } from 'helper/wordsData'
import { useMainStore } from '@/store/main'
const store = useMainStore() // main store

</script>
