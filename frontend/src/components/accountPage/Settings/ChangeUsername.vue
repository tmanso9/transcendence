<template>
  <v-expansion-panel class="edit-user__username">
    <v-expansion-panel-title
      expand-icon="mdi-plus"
      collapse-icon="mdi-minus"
      color="grey-darken-3"
    >
      Change username
    </v-expansion-panel-title>
    <v-expansion-panel-text>
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
          <v-btn type="submit" class="mt-n3 bg-deep-purple"
            >Change username</v-btn
          >
        </div>
      </v-form>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { noEmpty, fetchMe } from "@/utils";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const props = defineProps(["cookies"]);
const user = useUserStore();
const router = useRouter();

const username = ref("");
const usernameForm = ref<HTMLFormElement>();
const hasError = ref(false);
const errText = ref("");

const changeUsername = async () => {
  let isValid = { valid: false };
  if (usernameForm.value) {
    isValid = await usernameForm.value.validate();
  }
  if (!isValid.valid) return;
  const path = `http://localhost:3000/users/change-username`;
  const body = `username=${username.value}`;
  hasError.value = false;
  errText.value = "";
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
