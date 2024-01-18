<template>
  <div class="what">
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
    <v-btn v-if="account.status === 'IN_GAME'" class="watchButton mx-auto mt-n5 ml-10" color="deep-purple-darken-3"
    @click="watchGame">watch game</v-btn>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { isFriend, inviteToGame, apiURI } from "@/utils";
import { chatAppStore } from "@/store/chat";
import { useRouter } from "vue-router";
import { useGameStore } from "@/store/game";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";

const props = defineProps(["account", "isSelf", "myFriends", "connections"]);
const emit = defineEmits(["friendRequest"]);
const { sm, mdAndUp } = useDisplay();
const user = useUserStore();
const chat = chatAppStore();
const router = useRouter();
const game = useGameStore();
const cookies = inject<VueCookies>("$cookies");

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
      return () => inviteToGame(props.account.id, game, cookies);
    default:
      return null;
  }
});

const openChatChannel = async () => {
  try {
    const result = await fetch(`${apiURI}/channels`, {
      credentials: "include",
    });
    if (!result.ok) throw new Error(await result.text());
    const data = await result.json();
    const personalChat = data.filter((val: any) => {
      const { type, members } = val;
      const memberUsernames = members.map((val: any) => val.username);
      return (
        type === "personal" &&
        memberUsernames.includes(user.username) &&
        memberUsernames.includes(props.account.username)
      );
    });
    if (personalChat.length) {
      chat.selectChannel(personalChat[0].id);
    } else {
      chat.chatOpen = true;
      await chat.getAllChatData();
      chat.createChannel("personal", "", "", [props.account]);
    }
    chat.chatOpen = true;
  } catch (error) {
    error instanceof Error && console.log(error.message);
  }
};

const headerButtons = computed(() => {
  return [
    {
      text: "Chat",
      icon: "mdi-chat-outline",
      action: openChatChannel,
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

const watchGame = () => {
  console.log(props.account)
}
</script>

<style lang="scss">
.what{
  width: 800px;
  margin: 0 auto;
}
.watchButton{
  width: 90%;
  margin: 0 auto;
}
</style>
