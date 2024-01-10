<template>
  <v-text-field
    v-if="isSignUp"
    size="30"
    v-model="username"
    label="username (optional)"
    type="text"
    autofocus
    validateOn="submit"
    @update:focused="$emit('update-username', username)"
  />
  <v-text-field
    class="my-2"
    size="30"
    v-model="email"
    label="email"
    type="email"
    :rules="rules"
    validateOn="submit"
    @update:focused="$emit('update-email', email)"
  />
  <v-text-field
    size="30"
    v-model="password"
    :type="hidePwd ? 'password' : 'text'"
    label="password"
    :rules="rules"
    validateOn="submit"
    :append-inner-icon="pwdIcon"
    @click:append-inner="hidePwd = !hidePwd"
    @update:focused="$emit('update-password', password)"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ref } from "vue";

defineProps(["isSignUp"]);
defineEmits(["update-username", "update-email", "update-password"]);
const username = ref("");
const email = ref("");
const password = ref("");
const hidePwd = ref(true);

const pwdIcon = computed(() => {
  return hidePwd.value ? "mdi-eye-outline" : "mdi-eye-off-outline";
});

const rules = [
  (input: string) => {
    if (input) return true;
    return "Required";
  },
];
</script>
