<template>
    <div class="file-input">
        <label htmlFor="attachment">
            {{ t('chooseFile')}}
        </label>
        <input
            type="file"
            name="attachment"
            id="attachment"
            @change="handleFile"
        />
        <button
            v-if="props.modelValue?.name"
            class="custom-button-link-secondary"
            type="button"
            @click="deleteFile"
        >
            {{ t('deleteFile')}}
        </button>
    </div>
</template>

<script lang="ts" setup>
import { convertFileToBase64 } from 'helper/helpers';
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n({useScope: 'local'})
const props = defineProps({
	modelValue: Object,
});

onMounted(() => {
    console.log('modelValue', props.modelValue);
})

const handleFile = async (e: Event) => {
    const element = e.target as HTMLInputElement;
    if (!element.files) return;
    console.log('e.target.files', element.files);
    const base64 = await convertFileToBase64(element.files[0]);
    const file = {
        name: element.files[0].name.replace(/ /g, '_'),
        size: element.files[0].size,
        type: element.files[0].type,
        base64: base64,
    };
    console.log('file', file);
    emit('update:modelValue', file)
}

const deleteFile = () => {
    emit('update:modelValue', '');
}
</script>

<style lang="scss">
.file-input {
    @apply space-y-3;
}
</style>

<i18n lang="yaml">
    en:
        chooseFile: 'Choose audio file'
        deleteFile: 'Delete file'
    ru:
        chooseFile: 'Выбрать аудио файл'
        deleteFile: 'Удалить файл'
    zh:
        chooseFile: 'TBD'
        deleteFile: 'TBD'
</i18n>
    