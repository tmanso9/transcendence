<template>
  <div class="account__header d-flex flex-column align-center mx-auto">
    <div
      class="account__header__name-and-avatar d-flex align-center justify-space-around w-100 mx-auto"
    >
      <div
        class="account__header__name-and-avatar__name d-flex flex-column align-center mt-n2"
      >
        <h2
          class="text-center text-h5 text-sm-h4 mb-1 text-deep-purple-lighten-3"
        >
          {{ account.username }}
        </h2>
        <v-badge
          class="mb-4 mt-n2"
          :dot="true"
          location="start center"
          offset-x="-13"
          :color="mapColor"
        >
          <p class="text-subtitle-1 text-sm-h6">{{ account.status.replace("_", " ") }}</p>
        </v-badge>
        <p class="text-overline text-sm-button text-deep-purple-lighten-3">
          Rank: <span class="text-white">{{ account.rank }}</span>
        </p>
        <user-settings
          v-if="isSelf"
          :account="account"
          @accountUpdated="updateAccount"
        />
        <v-btn
          v-else-if="friendVal.alreadyFriends"
          @click="blockFriend.action"
          width="150px"
          class="block-button"
        >
          <v-icon>{{ blockFriend.icon }}</v-icon>
          <span class="ml-2">{{ blockFriend.text }}</span>
        </v-btn>
      </div>
      <v-divider vertical class=""></v-divider>
      <avatar-wrapper
        :account="account"
        :editAvatar="editAvatar"
        @edit="toggleEditAvatar"
        :isSelf="isSelf"
      />
    </div>
    <div class="acount__header__change-avatar w-100 mt-4">
      <change-profile-picture v-if="editAvatar && !mdAndUp" source="header" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";
import AvatarWrapper from "./AvatarWrapper.vue";
import ChangeProfilePicture from "./ChangeProfilePicture.vue";
import UserSettings from "@/components/accountPage/Settings/UserSettings.vue";
import { User } from "@/types";
import { useUserStore } from "@/stores/user";
import { chatAppStore } from "@/store/chat";
import { isFriend } from "@/utils";

const props = defineProps(["account", "isSelf", "myFriends", "connections"]);
const emits = defineEmits(["accountUpdated"]);
const { sm, mdAndUp } = useDisplay();
const editAvatar = ref(false);
const user = useUserStore();
const chat = chatAppStore();
const friendVal = ref(
  isFriend(props.myFriends, props.connections, user, props.account),
);

const blockFriend = computed(() => {
  const { alreadyFriends } = friendVal.value;
  if (alreadyFriends) {
    if (chat.userIsBlocked(props.account.id)) {
      return {
        text: "Unblock",
        icon: "mdi-cancel",
        action: () => chat.blockOrUnblockUser("unblock", props.account.id),
      };
    }
    return {
      text: "Block",
      icon: "mdi-cancel",
      action: () => chat.blockOrUnblockUser("block", props.account.id),
    };
  }
  return {
    text: "",
  };
});

const mapColor = computed(() => {
  switch (props.account.status) {
    case "ONLINE":
      return "success";
    case "OFFLINE":
      return "gray";
    default:
      return "deep-purple";
  }
});

const toggleEditAvatar = () => {
  editAvatar.value = !editAvatar.value;
};

const updateAccount = (user: User) => {
  emits("accountUpdated", user);
};
</script>

<style lang="scss">
.block-button {
  border: 1px solid #b39ddb;
}
</style>
