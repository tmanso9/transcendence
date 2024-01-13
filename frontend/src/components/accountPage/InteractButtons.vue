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
import { useDisplay } from "vuetify";
import { isFriend } from "@/utils";

const props = defineProps(["account", "isSelf", "myFriends", "connections"]);
const emit = defineEmits(["friendRequest"]);
const { sm, mdAndUp } = useDisplay();
const user = useUserStore();

const friendAction = computed(() => {
  const { alreadyFriends, pending } = isFriend(
    props.myFriends,
    props.connections,
    user,
    props.account,
  );
  if (alreadyFriends) {
    return {
      text: "Remove friend",
      icon: "mdi-account-minus-outline",
      action: () => emit("friendRequest", "remove-friend", props.account.id),
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
      action: () => emit("friendRequest", "friend-request", props.account.id),
      color: "",
    };
  }
});

const playAction = computed(() => {
  switch (props.account.status) {
    case "ONLINE":
      //implement endpoint here
      return () => {};
    default:
      return null;
  }
});

const headerButtons = computed(() => {
  return [
    {
      text: "Chat",
      icon: "mdi-chat-outline",
      action: () => {},
      color: "",
    },
    friendAction.value,
    {
      text: "Play pong",
      icon: "mdi-sword-cross",
      color: "deep-purple-darken-3",
      action: playAction.value,
    },
  ];
});

const buttonSize = computed(() => {
  return sm.value || mdAndUp.value ? "175px" : "75%";
});
</script>
