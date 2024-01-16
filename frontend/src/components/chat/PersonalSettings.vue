<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { useRouter } from "vue-router";

const router = useRouter();
const store = chatAppStore();
</script>
<template>
  <div class="channelSettings">
    <div class="channelSettings-header">
      <span class="text-h6"
        ><v-icon icon="mdi-cog" size="x-small"></v-icon
        >{{ " " + store.selectedUserProfile?.username }}
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
        <v-icon icon="mdi-account" size="x-large"></v-icon>
        <div>{{ store.selectedUserProfile?.username }}</div>
      </div>
      <div class="channelSettings-content-info"></div>
      <div class="channelSettings-content-buttons">
        <v-btn
          class="channelSettings-content-buttons-btn"
          append-icon="mdi-face-man-profile"
          @click="
            () => {
              router.push(`/users/${store.selectedUserProfile?.username}`);
            }
          "
          >Profile</v-btn
        >
        <v-btn
          :disabled="store.selectedUserProfile?.status !== 'ONLINE'"
          class="channelSettings-content-buttons-btn"
          append-icon="mdi-table-tennis"
          >Play Game</v-btn
        >
        <v-btn
          v-if="
            store.selectedUserProfile &&
            store.userIsBlocked(store.selectedUserProfile?.username) == false
          "
          class="channelSettings-content-buttons-btn"
          color="warning"
          append-icon="mdi-cancel"
          @click="
            () => {
              if (store.selectedUserProfile)
                store.blockOrUnblockUser('block', store.selectedUserProfile.id);
            }
          "
          >Block</v-btn
        >
        <v-btn
          v-else
          class="channelSettings-content-buttons-btn"
          color="warning"
          append-icon="mdi-arrow-u-left-top"
          @click="
            () => {
              if (store.selectedUserProfile)
                store.blockOrUnblockUser(
                  'unblock',
                  store.selectedUserProfile.id,
                );
            }
          "
          >Unblock</v-btn
        >
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
