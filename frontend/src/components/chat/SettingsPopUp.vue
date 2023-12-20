<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { ref } from "vue";

const store = chatAppStore();
const channel = store.getChannelInfo(store.selectedChannel);
</script>
<template>
  <div class="userSettingPopUp">
    <div class="userSettingPopUp-header">
      <span class="text-h6"
        ><v-icon :icon="store.selectedUserProfile?.avatar" size="small"></v-icon
        >{{ " " + store.selectedUserProfile?.username }}
      </span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            store.settingsAdminPopUp = false;
          }
        "
      ></v-icon>
    </div>
    <div class="userSettingPopUp-content">
      <div class="userSettingPopUp-content-info">
        <v-btn
          color="primary"
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-information-outline"
          @click="
            () => {
              store.settingsAdminPopUp = false;
              store.personalPopUpSettings = true;
            }
          "
          >Details</v-btn
        >
        <v-btn
          v-if="
            channel &&
            store.selectedUserProfile &&
            !store.isAdmin(channel.name, store.selectedUserProfile.username)
          "
          color="primary"
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-account-arrow-up"
          >Promote to Admin</v-btn
        >
        <v-btn
          v-else-if="channel?.creator != store.selectedUserProfile?.username"
          color="primary"
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-account-arrow-down"
          >Despromote from Admin</v-btn
        >
        <v-btn
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-volume-mute"
          >Mute</v-btn
        >
        <v-btn
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-karate"
          >Kick</v-btn
        >
        <v-btn
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-cancel"
          >Ban</v-btn
        >
        <v-btn
          color="warning"
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-minus-circle-outline"
          >Remove from channel</v-btn
        >
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
