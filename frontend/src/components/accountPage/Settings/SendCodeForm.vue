<template>
  <v-form @submit.prevent="sendCode">
    <v-text-field>Enter code</v-text-field>
    <v-btn type="submit" color="deep-purple">confirm</v-btn>
  </v-form>
</template>

<script lang="ts" setup>
import { User } from "@/types";

const p = defineProps(["path"]);
const e = defineEmits(["codeSent"]);

const sendCode = async () => {
  console.log(`http://localhost:3000/auth/2fa/${p.path}`);
  const user: User = {
    username: "test",
  };
  e("codeSent", user);
};
</script>
