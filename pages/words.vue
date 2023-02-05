<template>
  <div class="w-full">
    <NuxtLink to="/">Back to homepage</NuxtLink>
    <Lesson lessonType="words" />
  </div>
</template>

<script setup>
import { useMainStore } from '@/store/main'
const store = useMainStore() // main store

</script>
