<template>
  <div v-if="user.username">
    <h2 class="text-center mb-5 pb-5 text-h6">{{ getUsername }}'s account</h2>
    <account-wrapper v-if="isLoaded" :user="user" />
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

const user = ref<User>({});
const isLoaded = ref(false);

onBeforeMount(async () => {
  user.value = await fetchUser(getUsername.value);
  isLoaded.value = true;
});
</script>

<style></style>
