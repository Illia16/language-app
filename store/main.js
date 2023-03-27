import { defineStore } from "pinia";

export const useMainStore = defineStore('main-store', {
    state: () => ({
        lang: '',
        lessonType: "123",
        lessonStarted: false,
        lessonData: {},
    }),
    actions: {
        setLang(lang) {
            this.lang = lang;
        },
        setLessonType(i) {
            this.lessonType = i;
        },
        setLessonStarted(v) {
            this.lessonStarted = v;
        },
        setLessonData(data) {
            this.lessonData = data;
        }
    },
    persist: true,
});
