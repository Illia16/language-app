import { defineStore } from "pinia";
import { ArrayOfUserData } from 'types/helperTypes';

export const useMainStore = defineStore('main-store', {
    state: () => ({
        modalType: '',
        modalOpen: false,
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
