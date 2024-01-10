<template>
  <v-expansion-panel>
    <v-expansion-panel-title
      expand-icon="mdi-plus"
      collapse-icon="mdi-minus"
      color="grey-darken-3"
    >
      Disable Two-Factor Authentication
    </v-expansion-panel-title>
    <v-expansion-panel-text class="my-2">
      <send-code-form path="turn-off" @codeSent="handleCodeSent" />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { User } from "@/types";
import SendCodeForm from "./SendCodeForm.vue";

const emit = defineEmits(["codeSent"]);

const handleCodeSent = (user: User) => {
  emit("codeSent", user);
};
</script>
