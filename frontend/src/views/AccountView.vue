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
const myFriends = ref<string[]>([]);
const connections = ref<[string[]]>([[]]);

onBeforeMount(async () => {
  try {
    account.value = await fetchUser(getUsername.value);
    const result = await fetch(`http://localhost:3000/users/me/friends`, {
      credentials: "include",
    });
    if (!result.ok) throw new Error(await result.text());
    let data = await result.json();
    for (const friend of data.values()) {
      myFriends.value.push(friend);
    }
    // console.log(myFriends.value);
    const pending = await fetch(`http://localhost:3000/users/connections`, {
      credentials: "include",
    });
    if (!pending.ok) throw new Error(await pending.text());
    data = await pending.json();
    // console.log(data);
    for (const pair of data.values()) {
      console.log(pair);
      connections.value.push(pair);
    }
    // console.log(connections.value)
    if (account.value.username) isLoaded.value = true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") unauthorized.value = true;
      console.log(error);
    }
  }
});
</script>

<style></style>
