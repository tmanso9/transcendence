<template>
  <account-wrapper v-if="isLoaded" :account="account" />
  <h2 v-else-if="unauthorized">
    You must be logged in to see {{ getUsername }}'s profile
  </h2>
  <not-found-wrapper v-else />
</template>

<script lang="ts" setup>
import AccountWrapper from "@/components/accountPage/AccountWrapper.vue";
import NotFoundWrapper from "@/components/NotFoundWrapper.vue";
import { ref, onBeforeMount, computed } from "vue";
import { useRoute } from "vue-router";
import { fetchUser } from "@/utils";
import { User } from "@/types";

const route = useRoute();

const getUsername = computed(() => {
  const path = route.path;
  return path.split("/")[2] || "Please login";
});

const account = ref<User>({});
const isLoaded = ref(false);
const unauthorized = ref(false);

onBeforeMount(async () => {
  try {
    account.value = await fetchUser(getUsername.value);
    if (account.value && account.value.username) isLoaded.value = true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") unauthorized.value = true;
      console.log(error);
    }
  }
});
</script>

<style></style>
