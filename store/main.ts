import { defineStore } from "pinia";

export const useMainStore = defineStore('main-store', {
    state: () => ({
        modalType: '',
        modalOpen: false,
        lang: '',
        lessonType: "123",
        lessonStarted: false,
    }),
    actions: {
        setModalType(v: string) {
            this.modalType = v;
        },
        setModalOpen(v: boolean) {
            this.modalOpen = v;
        },
        setLang(lang: string) {
            this.lang = lang;
        },
        setLessonType(i: string) {
            this.lessonType = i;
        },
        setLessonStarted(v: boolean) {
            this.lessonStarted = v;
        },
    },
    // persist: true,
});
