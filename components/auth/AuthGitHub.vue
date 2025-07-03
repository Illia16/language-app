<template>
  <div class="flex flex-col gap-2">
    <button type="button" @click="loginWithGitHub" class="custom-button-auth">
      <img src="/icons-github.svg" alt="GitHub" class="w-6 h-6" />
      <span>
        {{ t('submit') }}
      </span>
    </button>
    <button type="button" @click="store.setModalOpen(true); store.setModalType('signup--with-github');"
      class="custom-button-auth">
      <img src="/icons-github.svg" alt="GitHub" class="w-6 h-6" />
      <span>
        {{ t('createAccount') }}
      </span>
    </button>
  </div>

  <teleport to="body">
    <Modal v-if="store.modalOpen && store.modalType === 'signup--with-github'" class="modal-signup">
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
        <button class="custom-button-link" @click="signupWithGitHub">{{
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

const loginWithGitHub = async () => {
  const clientId = config.public.GITHUB_CLIENT_ID as string;
  const redirectUri = `${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/login-github`;
  const scope = "read:user user:email";
  const authEndpoint = "https://github.com/login/oauth/authorize";

  const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(
    scope
  )}&prompt=select_account`;

  navigateTo(authUrl, { external: true });
}

const signupWithGitHub = async () => {
  if (!signup_invitation_code.value || !v_motherTongue.value) {
    return
  }

  const clientId = config.public.GITHUB_CLIENT_ID as string;
  const redirectUri = `${config.public.API_URL_USERS}/${config.public.ENV_NAME}/users/signup-github`;
  const scope = "read:user user:email";
  const authEndpoint = "https://github.com/login/oauth/authorize";

  const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(
    scope
  )}&prompt=select_account&state=${JSON.stringify({ invitationCode: signup_invitation_code.value, userMotherTongue: v_motherTongue.value })}`;

  navigateTo(authUrl, { external: true });
}

</script>

<style lang="scss"></style>