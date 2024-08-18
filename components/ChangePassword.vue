<template>
    <div class="change-password--container">
        <div class="form_el">
            <label>{{t('password')}}</label>
            <input type="password" v-model="new_pw" />
        </div>
        <div class="form_el">
            <label>{{t('retypePassword')}}</label>
            <input type="password" v-model="retynew_pw" />
        </div>
        <div v-if="new_pw !== retynew_pw" class="field-error">{{ t('passowrdsNoMatch') }}</div>
        <div class="mt-4">
            <button class="custom-button-link" @click="handleChangePassword">Ok</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
const emit = defineEmits(["pwChangedSuccess"])
const { t } = useI18n({
  useScope: 'local'
})
const store = useMainStore();
const config = useRuntimeConfig();

// Change pw
const new_pw = ref<string>('');
const retynew_pw = ref<string>('');
//

const handleChangePassword = async () => {
    if (!new_pw.value || new_pw.value !== retynew_pw.value || !store.token || !store.currentUserId) {
        return
    }

    store.setLoading(true);
    await fetch(`${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/change-password`, {
        method: 'POST',
        body: JSON.stringify({
            "userId": store.currentUserId,
            "password": new_pw.value,
        }),
        headers: {
            "Authorization": `Bearer ${store.token}`
        }
    })
    .then(res => res.json())
    .then(res => {
        if (res.success) {
            emit("pwChangedSuccess")
        }
    })
    .catch(err => {
        console.log('err signup API:', err);
    })
    .finally(() => {
        store.setLoading(false);
        new_pw.value = '';
        retynew_pw.value = '';
    });
}
</script>


<i18n lang="yaml">
    en:
        password: 'New password'
        retypePassword: 'Retype new password'
        passowrdsNoMatch: "Passwords don't match"
    ru:
        password: 'Новый пароль'
        retypePassword: 'Повторите новый пароль'
        passowrdsNoMatch: 'Пароли не совпадают'
    zh:
        password: '新密碼'
        retypePassword: '重新輸入新密碼'
        passowrdsNoMatch: '密碼不匹配'
</i18n>
