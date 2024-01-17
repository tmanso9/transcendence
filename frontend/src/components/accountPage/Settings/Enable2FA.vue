<template>
  <v-expansion-panel @group:selected="generateCode">
    <v-expansion-panel-title
      expand-icon="mdi-plus"
      collapse-icon="mdi-minus"
      color="grey-darken-3"
    >
      Enable Two-Factor Authentication
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <p class="text-overline edit-user__2fa__text">
        Scan with Google Authenticator app
      </p>
      <v-img :src="QRSource" alt="generate code" class="edit-user__2fa__code" />
      <p class="text-overline mt-n2 mb-1">enter code</p>
      <send-code-form path="turn-on" @codeSent="handleCodeSent" />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { Selected, User } from "@/types";
import { ref } from "vue";
import SendCodeForm from "./SendCodeForm.vue";
import { apiURI } from "@/utils";

const emit = defineEmits(["codeSent"]);
const QRSource = ref("");
const hasError = ref(false);
const errText = ref("");

const handleCodeSent = (user: User) => {
  emit("codeSent", user);
};

const generateCode = async (val: Selected) => {
  if (!val.value || QRSource.value.length) return;
  try {
    const result = await fetch(`${apiURI}/auth/2fa/generate`, {
      credentials: "include",
    });
    if (!result.ok) throw new Error(await result.text());
    const data = await result.text();
    // console.log(data);
    QRSource.value = data;
  } catch (error) {
    hasError.value = true;
    if (error instanceof Error)
      errText.value = JSON.parse(error.message).message;
    console.error(error);
  }
};
</script>
