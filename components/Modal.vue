<template>
    <div id="modal">
        <button class="modal-close-btn" @click="closeModal">
            <span class="sr-only">Close modal</span>
        </button>
        <div class="modal-shadow"></div>
        <div  ref="modalRef" class="modal-content">
            <slot />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main'
const store = useMainStore()
const emit = defineEmits(["closeCallback"])
const modalRef = ref<HTMLElement>(null);

const closeModal = () => {
    store.setModalOpen(false)
    store.setModalType('')
    emit("closeCallback")
}

onMounted(() => {
    document.body.classList.add('lock-scroll')
    document.addEventListener('mousedown', clickOutside);
})

onBeforeUnmount(() => {
    document.body.classList.remove('lock-scroll')
    document.removeEventListener('mousedown', clickOutside);
})

const clickOutside = (e: Event):void => {    
    if (!modalRef.value.contains(e.target as HTMLElement)) store.setModalOpen(false)
}
</script>

<style lang="scss">
    .modal-close-btn {
        @apply fixed top-[8vh] right-[5%] z-20 w-12 h-12 rounded-3xl bg-[#fffaf6] border-solid border-4 border-mainGreen;

        &:before {
            content: "X";
            @apply text-mainGreen text-3xl font-bold;
        }
    }
    .modal-shadow {
        @apply fixed bg-slate-300 opacity-75 inset-0 z-[5];
    }
    .modal-content {
        @apply fixed z-10 bg-[#fffaf6] border-solid border-8 border-mainGreen top-[10vh] p-3 rounded-3xl overflow-y-scroll max-h-[80vh] w-[90%] right-[5%];
    }

    .lock-scroll {
        @apply overflow-hidden;
    }
</style>

