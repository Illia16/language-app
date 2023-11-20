import { defineStore } from "pinia";
import { UserDataArrayOfObj } from 'types/helperTypes';

export const useMainStore = defineStore('main-store', {
    state: () => ({
        modalType: '',
        modalOpen: false,
        lessonStarted: false,
        currentUserName: '',
        userLangData: [] as UserDataArrayOfObj, 
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
        setUserLangData(v: UserDataArrayOfObj) {
            this.userLangData = v;
        },
    },
    // persist: true,
});
