import { defineStore } from "pinia";

export const useMainStore = defineStore('main-store', {
    state: () => ({
        lessonType: "123",
        lessonStarted: false,
        lessonData: {},
    }),
    actions: {
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
    // getter here is like computed
    // getters: {
    //     lessonType: (state) => state.lessonType,
    // },
});
