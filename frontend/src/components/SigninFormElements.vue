<template>
  <v-text-field
    v-if="isSignUp"
    size="30"
    v-model="username"
    label="username (optional)"
    type="text"
    autofocus
	@update:focused="$emit('update-username', username)"
  />
  <v-text-field
  class="my-2"
    size="30"
    v-model="email"
    label="email"
    type="email"
    :rules="rules"
	@update:focused="$emit('update-email', email)"
  />
  <v-text-field
    size="30"
    v-model="password"
    label="password"
    type="password"
    :rules="rules"
	@update:focused="$emit('update-password', password)"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps(['isSignUp']);
defineEmits(['update-username', 'update-email', 'update-password'])
const username = ref("");
const email = ref("");
const password = ref("");

const rules = [
  (input: string) => {
    if (input) return true;
    return "Required";
  },
];
</script>
