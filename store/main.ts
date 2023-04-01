import { defineStore } from "pinia";

export const useMainStore = defineStore('main-store', {
    state: () => ({
        lang: '',
        lessonType: "123",
        lessonStarted: false,
    }),
    actions: {
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
