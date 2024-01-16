<template>
  <account-wrapper
    v-if="isLoaded"
    :account="account"
    :myFriends="myFriends"
    :connections="connections"
  />
  <h2 v-else-if="unauthorized">
    You must be logged in to see {{ getUsername }}'s profile
  </h2>
  <not-found-wrapper v-else-if="notFound" />
</template>

<script lang="ts" setup>
import AccountWrapper from "@/components/accountPage/AccountWrapper.vue";
import NotFoundWrapper from "@/components/NotFoundWrapper.vue";
import { ref, onBeforeMount, computed } from "vue";
import { useRoute } from "vue-router";
import { fetchOtherUser } from "@/utils";
import { User } from "@/types";
import { onMounted } from "vue";

const route = useRoute();

const getUsername = computed(() => {
  const path = route.path;
  return path.split("/")[2] || "Please login";
});

const account = ref<User>({});
const isLoaded = ref(false);
const unauthorized = ref(false);
const notFound = ref(false);
const myFriends = ref<string[]>([]);
const connections = ref<[string[]]>([[]]);

onMounted(async () => {
  try {
    isLoaded.value = false;
    account.value = await fetchOtherUser(getUsername.value);
    const result = await fetch(`http://localhost:3000/users/me/friends`, {
      credentials: "include",
    });
    if (!result.ok) throw new Error(await result.text());
    let data = await result.json();
    for (const friend of data.values()) {
      myFriends.value.push(friend);
    }
    const pending = await fetch(`http://localhost:3000/users/connections`, {
      credentials: "include",
    });
    if (!pending.ok) throw new Error(await pending.text());
    data = await pending.json();
    for (const pair of data.values()) {
      connections.value.push(pair);
    }
    if (account.value && account.value.username) isLoaded.value = true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") unauthorized.value = true;
      else if (error.message === "Forbidden") notFound.value = true;
      console.log(error);
    }
  }
});
</script>

<style></style>
