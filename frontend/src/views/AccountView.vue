<template>
  <component v-if="isLoaded" :is="loadedComponent" :account="account" />
</template>

<script lang="ts" setup>
import AccountWrapper from "@/components/accountPage/AccountWrapper.vue";
import NotFoundWrapper from "@/components/NotFoundWrapper.vue";
import { ref } from "vue";
import { onMounted, onBeforeMount } from "vue";
import { computed } from "vue";
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

onBeforeMount(async () => {
  account.value = await fetchUser(getUsername.value);
  isLoaded.value = true;
});

const loadedComponent = computed(() => {
  return account.value.username ? AccountWrapper : NotFoundWrapper;
});
</script>

<style></style>
