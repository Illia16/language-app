<template>
    <div class="file-input">
        <label htmlFor="attachment">
            {{ t('chooseFile')}}
            ({{ t('optional') }})
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
    emit('update:modelValue', element.files[0])
}

const deleteFile = () => {
    emit('update:modelValue', '');
}
</script>

<style lang="scss">
.file-input {
    @apply flex flex-col space-y-3;
}
</style>

<i18n lang="yaml">
    en:
        chooseFile: 'Choose audio file'
        optional: 'Optional'
        deleteFile: 'Delete file'
    ru:
        chooseFile: 'Выбрать аудио файл'
        optional: 'Необязательно'
        deleteFile: 'Удалить файл'
    zh:
        chooseFile: '選擇音訊檔案'
        optional: '選修的'
        deleteFile: '刪除文件'
</i18n>
