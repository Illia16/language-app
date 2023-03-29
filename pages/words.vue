<template>
  <div class="w-full">
    <BackToHomeBtn />
    <Lesson lessonType="words" />
  </div>
</template>

<script setup>
import { useMainStore } from '@/store/main'
const store = useMainStore() // main store

</script>
