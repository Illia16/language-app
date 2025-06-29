<template>
  <div class="flex flex-col gap-2">
    <button type="button" @click="loginWithGoogle" class="custom-button-auth">
      <img src="/icons-google.svg" alt="Google" class="w-6 h-6" />
      <span>
        {{ t('submit') }}
      </span>
    </button>
    <button type="button" @click="store.setModalOpen(true); store.setModalType('signup--with-google');"
      class="custom-button-auth">
      <img src="/icons-google.svg" alt="Google" class="w-6 h-6" />
      <span>
        {{ t('createAccount') }}
      </span>
    </button>
  </div>

  <teleport to="body">
    <Modal v-if="store.modalOpen && store.modalType === 'signup--with-google'" class="modal-signup">
      <CustomSelect v-model="v_motherTongue" :options="[
        {
          name: 'English',
          value: 'en',
        },
        {
          name: 'Chinese',
          value: 'zh',
        },
        {
          name: 'Russian',
          value: 'ru',
        },
      ]" state="lang">
        <template v-slot:label>{{ t('motherTongue') }}</template>
      </CustomSelect>
      <div class="form_el">
        <label>{{ t('invitationCode') }}</label>
        <input type="text" v-model="signup_invitation_code" />
      </div>
      <p class="signupEmailNote">{{ t('signupEmailNote') }}</p>
      <div class="mt-4">
        <button class="custom-button-link" @click="signupWithGoogle">{{
          t('createAccount') }}</button>
      </div>
    </Modal>
  </teleport>
</template>

<script lang="ts" setup>
import { useMainStore } from 'store/main';
const config = useRuntimeConfig();
const store = useMainStore();
const { locale, t, setLocale } = useI18n({ useScope: 'parent' });

const v_motherTongue = ref<string>('en');
const signup_invitation_code = ref<string>('');

const loginWithGoogle = async () => {
  const clientId = config.public.GOOGLE_CLIENT_ID as string;
  const redirectUri = `${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/login-google`;
  const scope = "openid email profile";
  const responseType = "code";
  const authEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=${responseType}&scope=${encodeURIComponent(
    scope
  )}&prompt=consent&access_type=offline`;

  navigateTo(authUrl, { external: true });
}

const signupWithGoogle = async () => {
  if (!signup_invitation_code.value || !v_motherTongue.value) {
    return
  }

  const clientId = config.public.GOOGLE_CLIENT_ID as string;
  const redirectUri = `${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/signup-google`;
  const scope = "openid email profile";
  const responseType = "code";
  const authEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=${responseType}&scope=${encodeURIComponent(
    scope
  )}&prompt=consent&access_type=offline&state=${JSON.stringify({ invitationCode: signup_invitation_code.value, userMotherTongue: v_motherTongue.value })}`;

  navigateTo(authUrl, { external: true });
}

</script>

<style lang="scss"></style>