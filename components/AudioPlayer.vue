<template>
    <span class="audio-player">
        <audio ref="audioRef" controls :src="file" @ended="onEndPlay">
            <source :src="file" type="audio/mp3">
            <source :src="file" type="audio/m4a">
        </audio>
        <button @click="togglePlay">
            <span v-show="!isPlaying"></span>
            <span v-show="isPlaying"></span>
            <span class="sr-only">{{ t('playBtn') }}</span>
        </button>
    </span>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n({useScope: 'local'})
const props = defineProps({
    file: {
        required: true,
        type: String,
    },
    playRightAway: {
        required: false,
        type: Boolean,
        default: false,
    },
})

const audioRef = ref<HTMLAudioElement>(null);
const isPlaying = ref<boolean>(false);

onMounted(() => {
    if (props.playRightAway) {
        audioRef.value.play();
        isPlaying.value = true;
    }
})

const onEndPlay = () => {
    isPlaying.value = false;
}

const togglePlay = () => {
    if (audioRef.value.paused) {
        audioRef.value.play();
        isPlaying.value = true;
    } else {
        audioRef.value.pause();
        isPlaying.value = false;
    }
}

</script>

<style lang="scss">
.audio-player {
    audio {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    button {
        @apply bg-mainGreen w-10 h-10 rounded-full;

        span:nth-child(1) {
            content: '';
            @apply inline-block relative top-px left-0.5;
            border-width: 8px 0 8px 16px;
            border-color: transparent transparent transparent white;
        }

        span:nth-child(2) {
            content: '';
            border-color: white;
            border-style: double;
            border-width: 0px 0px 0px 8px;
        }
    }
}
</style>

<i18n lang="yaml">
    en:
        playBtn: 'Play/Pause'
    ru:
        playBtn: 'Воспроизвусти/пауза'
    zh:
        playBtn: '播放/暫停'
</i18n>
