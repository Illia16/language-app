<template>
    <div>
        <p>Hi there</p>
        <p class="bg-teal-700">Hi again!</p>
        <p class="specialP">special paragraph</p>

        <!-- <button @click="handleLesson(true)" :disabled="!numQuestions || !mode">Start</button> -->
        <div>
            Counter: {{ counter }}
            <button @click="counter++">+</button>
            <button @click="counter--">-</button>
        </div>
    </div>
</template>

<script setup>
const counter = useState("counter", () => 0);
</script>
