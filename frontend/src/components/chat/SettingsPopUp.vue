<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { onMounted } from "vue";
import { ref } from "vue";

const store = chatAppStore();
const channel = store.getChannelInfo(store.selectedChannel);
onMounted(async () => {
  console.log(store.selectedUserProfile);
});
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
            store.isAdmin(channel.id, store.selectedUserProfile.id) == false
          "
          color="primary"
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-account-arrow-up"
          @click="
            () => {
              if (store.selectedUserProfile && channel) {
                store.promoteOrDespromoteAdmin(
                  channel.id,
                  'promote',
                  store.selectedUserProfile.id,
                );
              }
              store.settingsAdminPopUp = false;
            }
          "
          >Promote to Admin</v-btn
        >
        <v-btn
          v-else-if="channel?.creator != store.selectedUserProfile?.username"
          color="primary"
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-account-arrow-down"
          @click="
            () => {
              if (store.selectedUserProfile && channel) {
                store.promoteOrDespromoteAdmin(
                  channel.id,
                  'despromote',
                  store.selectedUserProfile.id,
                );
              }
              store.settingsAdminPopUp = false;
            }
          "
          >Despromote from Admin</v-btn
        >
        <v-btn
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-volume-mute"
          @click="
            () => {
              if (channel && store.selectedUserProfile) {
                store.banMuteKickUserFromChannnel(
                  channel.id,
                  'mute',
                  store.selectedUserProfile.id,
                );
              }
              store.settingsAdminPopUp = false;
            }
          "
          >Mute</v-btn
        >
        <v-btn
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-karate"
          @click="
            () => {
              if (channel && store.selectedUserProfile) {
                store.banMuteKickUserFromChannnel(
                  channel.id,
                  'kick',
                  store.selectedUserProfile.id,
                );
              }
              store.settingsAdminPopUp = false;
            }
          "
          >Kick</v-btn
        >
        <v-btn
          class="userSettingPopUp-content-info-btn"
          append-icon="mdi-cancel"
          @click="
            () => {
              if (channel && store.selectedUserProfile) {
                store.banMuteKickUserFromChannnel(
                  channel.id,
                  'ban',
                  store.selectedUserProfile.id,
                );
              }
              store.settingsAdminPopUp = false;
            }
          "
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
