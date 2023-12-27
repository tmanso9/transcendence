<template>
  <v-form @submit.prevent="sendCode" ref="form">
    <v-text-field v-model="code" label="Enter code" />
    <v-btn type="submit" color="deep-purple">confirm</v-btn>
  </v-form>
</template>

<script lang="ts" setup>
import { User } from "@/types";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";
import { computed } from "vue";

const p = defineProps(["path"]);
const e = defineEmits(["codeSent", "error", "clearError"]);
const code = ref();
const form = ref<HTMLFormElement>();
const router = useRouter();
const route = useRoute();
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");

const emailValue = computed(() => {
  const val = cookies?.get("email") || user.email;
  console.log(val);
  return val;
});

const sendCode = async () => {
  const path = `http://localhost:3000/auth/2fa/${p.path}`;
  //   console.log(path);
  //   console.log(code.value);
  const body = `tfa_code=${code.value || ""}&email=${emailValue.value}`;
  cookies?.set("email", "");
  //   console.log(body);
  e("clearError");
  try {
    const result = await fetch(path, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      credentials: "include",
    });
    if (result.ok) {
      const data = await result.json();
      //   console.log("aqui");
      code.value = "";
      if (route.path === "/2fa") {
        router.push(history.state.back);
      } else {
        e("codeSent", data);
      }
    } else {
      throw new Error(await result.text());
    }
  } catch (error) {
    error instanceof Error && e("error", JSON.parse(error.message).message);
    console.error(error);
  }
};
</script>
