import { defineStore } from "pinia";
import { UserDataArrayOfObj } from 'types/helperTypes';

export const useMainStore = defineStore('main-store', {
    state: () => ({
        modalType: '',
        modalOpen: false,
        lessonStarted: false,
        currentUserName: '',
        currentUserId: '',
        userRole: '',
        token: '',
        userLangData: [] as UserDataArrayOfObj,
        userMotherTongue: '',
        loading: false,
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
        setCurrentUserId(v: string) {
            this.currentUserId = v;
        },
        setUserRole(v: string) {
            this.userRole = v;
        },
        setToken(v: string) {
            this.token = v;
        },
        setUserLangData(v: UserDataArrayOfObj) {
            this.userLangData = v;
        },
        setUserMortherTongue(v: string) {
            this.userMotherTongue = v;
        },
        setLoading(v: boolean) {
            this.loading = v;
        }
    },
});
