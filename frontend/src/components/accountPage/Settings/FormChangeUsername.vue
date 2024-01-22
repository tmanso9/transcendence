<template>
  <p v-if="hasError" class="text-red text-caption">
    {{ errText }}
  </p>
  <v-form
    @submit.prevent="changeUsername()"
    class="d-flex flex-column align-center"
    ref="usernameForm"
  >
    <v-text-field
      v-model="username"
      label="New username"
      type="text"
      class="w-100 my-2 edit-user__username__input"
      autofocus
      :rules="noEmpty"
      density="compact"
      validateOn="submit"
      variant="outlined"
    />
    <div>
      <v-btn type="submit" class="mt-n3 bg-deep-purple">Change username</v-btn>
    </div>
  </v-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { noEmpty, fetchMe, apiURI } from "@/utils";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";

const props = defineProps(["cookies"]);
const user = useUserStore();
const router = useRouter();

const hasError = ref(false);
const errText = ref("");
const username = ref("");
const usernameForm = ref<HTMLFormElement>();

const changeUsername = async () => {
  let isValid = { valid: false };
  hasError.value = false;
  errText.value = "";
  if (usernameForm.value) {
    isValid = await usernameForm.value.validate();
  }
  if (!isValid.valid) return;
  const path = `${apiURI}/users/change-username`;
  const body = `username=${username.value}`;
  try {
    const result = await fetch(path, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      credentials: "include",
    });
    username.value = "";
    if (!result.ok) throw new Error(await result.text());
    const data = await result.json();
    user.username = data.username;
    await fetchMe(props.cookies, user);
    router.push(`/users/${user.username}`);
  } catch (error) {
    hasError.value = true;
    if (error instanceof Error)
      errText.value = JSON.parse(error.message).message;
    console.error(error);
  }
};
</script>
