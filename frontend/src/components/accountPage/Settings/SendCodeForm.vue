<template>
  <v-form @submit.prevent="sendCode" ref="form">
    <v-text-field v-model="code" label="Enter code" />
    <v-btn type="submit" color="deep-purple">confirm</v-btn>
  </v-form>
</template>

<script lang="ts" setup>
import { User } from "@/types";
import { ref } from "vue";

const p = defineProps(["path"]);
const e = defineEmits(["codeSent"]);
const code = ref();
const form = ref<HTMLFormElement>();

const sendCode = async () => {
  const path = `http://localhost:3000/auth/2fa/${p.path}`;
  console.log(path);
  console.log(code.value);
  const body = `tfa_code=${code.value || ""}`;
  console.log(body);
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
      console.log("aqui");
      code.value = "";
      e("codeSent", data);
    }
  } catch (error) {
    console.error(error);
  }
};
</script>
