<script setup lang="ts">
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
const channel = store.getChannelInfo(store.selectedChannel);
</script>
<template>
  <div class="channelSettings">
    <div class="channelSettings-header">
      <span class="text-h6"
        ><v-icon icon="mdi-cog" size="x-small"></v-icon
        >{{ " " + store.selectedChannel }}
      </span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            store.personalPopUpSettings = false;
          }
        "
      ></v-icon>
    </div>
    <div class="channelSettings-content">
      <div class="channelSettings-content-profile">
        <v-icon
          :icon="store.selectedUserProfile?.avatar"
          size="x-large"
        ></v-icon>
        <div>{{ store.selectedUserProfile?.username }}</div>
      </div>
      <div class="channelSettings-content-info"></div>
      <div class="channelSettings-content-buttons">
        <v-btn color="primary">Play Game</v-btn>
        <v-btn color="primary">Block</v-btn>
        <v-btn
          v-if="
            channel?.type != 'personal' &&
            store.isAdmin(store.selectedChannel, store.currentUser) &&
            store.selectedUserProfile?.username != channel?.creator
          "
          color="primary"
          >Kick {{ " from " + store.selectedChannel }}</v-btn
        >
        <v-btn
          v-else-if="
            channel?.type != 'personal' &&
            store.isAdmin(store.selectedChannel, store.currentUser) &&
            store.selectedUserProfile?.username == channel?.creator
          "
          color="primary"
          disabled
          >Kick {{ " from " + store.selectedChannel }}</v-btn
        >
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
