<template>
  <div
    v-if="!isSelf"
    class="d-flex flex-column flex-sm-row justify-space-evenly mx-auto my-10 account__header__buttons"
    :width="mdAndUp ? '80%' : '100%'"
  >
    <v-btn
      v-for="button in headerButtons"
      :key="button.text"
      :width="buttonSize"
      class="mx-auto my-2 my-sm-0 account__header__buttons__button py-3 d-flex align-center"
      :color="button.color"
      @click="button.action"
      :disabled="button.action === null"
    >
      <v-icon>{{ button.icon }}</v-icon>
      <span class="ml-2">{{ button.text }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const props = defineProps(["account", "isSelf", "myFriends", "connections"]);
const { sm, mdAndUp } = useDisplay();
const router = useRouter();
const user = useUserStore();

const friendRequest = async (path: string) => {
  // console.log(props.account)
  try {
    // console.log("oi");
    const url = `http://localhost:3000/users/${path}/${props.account.id}`;
    const result = await fetch(url, {
      method: "post",
      credentials: "include",
    });
    if (!result.ok) throw new Error(await result.text());
    const data = await result.text();
    router.go(0);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
};

const friendAction = computed(() => {
  const friendArr = [];
  for (const friend of props.myFriends as unknown as Array<string>) {
    friendArr.push(friend);
  }
  const connectionsArr = [];
  for (const connection of props.connections as unknown as Array<
    Array<string>
  >) {
    if (connection.length) connectionsArr.push(Array.from(connection));
  }
  let pending = false;
  for (const connection of connectionsArr) {
    if (
      connection.includes(props.account.username) &&
      connection.includes(user.username)
    ) {
      pending = true;
      break;
    }
  }
  //   console.log(connectionsArr);
  if (friendArr.includes(props.account.username)) {
    return {
      text: "Remove friend",
      icon: "mdi-account-minus-outline",
      action: () => friendRequest("remove-friend"),
    };
  } else if (pending) {
    return {
      text: "pending",
      icon: "mdi-account-outline",
      action: null,
    };
  } else {
    return {
      text: "Add friend",
      icon: "mdi-account-plus-outline",
      action: () => friendRequest("friend-request"),
      color: "",
    };
  }
});

const headerButtons = [
  {
    text: "Chat",
    icon: "mdi-chat-outline",
    action: () => friendRequest(""),
    color: "",
  },
  friendAction.value,
  {
    text: "Play pong",
    icon: "mdi-sword-cross",
    color: "deep-purple-darken-3",
    action: () => friendRequest(""),
  },
];

const buttonSize = computed(() => {
  return sm.value || mdAndUp.value ? "175px" : "75%";
});
</script>
