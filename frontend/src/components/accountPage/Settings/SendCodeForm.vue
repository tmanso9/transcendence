<template>
  <div>
    <p v-if="hasError" class="text-red py-3 pl-1 mt-n2">{{ errText }}</p>
    <v-form @submit.prevent="sendCode" ref="form" class="d-flex flex-column">
      <v-text-field
        v-model="code"
        placeholder="000000"
        autofocus
        class="mt-n2 mb-4"
        :rules="rules"
        density="compact"
        validate-on="submit"
        variant="outlined"
      />
      <v-btn type="submit" color="deep-purple" class="mt-n3">confirm</v-btn>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";
import { computed } from "vue";
import { fetchMe, apiURI } from "@/utils";

const p = defineProps(["path"]);
const e = defineEmits(["codeSent"]);
const code = ref();
const form = ref<HTMLFormElement>();
const router = useRouter();
const route = useRoute();
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");
const hasError = ref(false);
const errText = ref("");

const emailValue = computed(() => {
  const val = cookies?.get("email") || user.email;
  return val;
});

const rules = [
  (input: string) => {
    if (input) return true;
    return "Required";
  },
];

const sendCode = async () => {
  hasError.value = false;
  errText.value = "";
  if (form.value) {
    const isValid = await form.value.validate();
    if (!isValid.valid) return;
  }
  const path = `${apiURI}/auth/2fa/${p.path}`;
  const body = `tfa_code=${code.value || ""}&email=${emailValue.value}`;
  try {
    const result = await fetch(path, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      credentials: "include",
    });
    code.value = "";
    if (result.ok) {
      cookies?.remove("email");
      const data = await result.json();
      if (route.path === "/2fa") {
        await fetchMe(cookies, user);
        router.push(`/users/${user.username}`);
      } else {
        e("codeSent", data);
      }
    } else {
      throw new Error(await result.text());
    }
  } catch (error) {
    if (error instanceof Error) {
      hasError.value = true;
      errText.value = JSON.parse(error.message).message;
    }
    console.error(error);
  }
};
</script>
