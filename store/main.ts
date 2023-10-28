import { defineStore } from "pinia";
import { UserData, ArrayOfUserData } from 'types/helperTypes';

export const useMainStore = defineStore('main-store', {
    state: () => ({
        modalType: '',
        modalOpen: false,
        lang: '',
        lessonType: "123",
        lessonStarted: false,
        currentUserName: '',
        userLangData: [] as ArrayOfUserData, 
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
        setCurrentUserName(v: string) {
            this.currentUserName = v;
        },
        setUserLangData(v: ArrayOfUserData) {
            this.userLangData = v;
        },
    },
    // persist: true,
});
