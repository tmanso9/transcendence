<template>
  <div v-if="account.username">
    <account-wrapper v-if="isLoaded" :account="account" />
  </div>
  <h2 v-else-if="isLoaded" class="text-center text-red">
    The user {{ getUsername }} does not exist
  </h2>
</template>

<script lang="ts" setup>
import AccountWrapper from "@/components/accountPage/AccountWrapper.vue";
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
</script>

<style></style>
