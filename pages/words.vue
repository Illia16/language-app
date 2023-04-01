<template>
  <div class="page-words">
    <Lesson lessonType="words" />
  </div>
</template>

<script setup>
import { useMainStore } from '@/store/main'
const store = useMainStore() // main store

</script>
