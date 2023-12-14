<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { ref } from "vue";
import PersonalSettings from "./PersonalSettings.vue";
import SettingsPopUp from "./SettingsPopUp.vue";

const store = chatAppStore();
const channelSettings = ref(false);
const channel = ref(store.getChannelInfo(store.selectedChannel));
</script>
<template>
  <v-icon
    icon="mdi-cog"
    size="x-small"
    @click="
      () => {
        if (channel?.type == 'personal') {
          store.selectedUserProfile = store.findUserByUsername(channel.name);
          store.personalPopUpSettings = true;
        } else channelSettings = true;
      }
    "
  ></v-icon>
  <personal-settings v-if="store.personalPopUpSettings"></personal-settings>
  <div v-else-if="channelSettings" class="channelSettings">
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
            channelSettings = false;
          }
        "
      ></v-icon>
    </div>
    <div class="channelSettings-content">
      <div class="channelSettings-content-profile">
        <v-icon :icon="channel?.avatar" size="x-large"></v-icon>
      </div>
      <div class="channelSettings-content-info">
        {{ channel?.type + " - " }}
        {{ channel?.members.length + " " }}
        members
      </div>
      <v-virtual-scroll
        v-if="channel"
        :items="store.channelMembers(channel.name)"
        height="250"
        class="channelSettings-content-users"
      >
        <template v-slot:default="{ item }"
          ><div
            class="channelSettings-content-users-user"
            @click="
              () => {
                store.selectedUserProfile = store.findUserByUsername(
                  item.username
                );
                if (channel && store.isAdmin(channel.name, store.currentUser))
                  store.settingsAdminPopUp = true;
                else store.personalPopUpSettings = true;
              }
            "
          >
            <div class="channelSettings-content-users-user-profile">
              <v-icon
                class="channelSettings-content-users-user-profile-icon"
                :icon="item.avatar"
              ></v-icon>
              <div>{{ item.username }}</div>
            </div>
            <div
              class="channelSettings-content-users-user-operator"
              v-if="item.username == channel.creator"
            >
              <v-icon icon="mdi-crown" size="x-small"></v-icon>
              Admin
            </div>
            <div
              class="channelSettings-content-users-user-operator"
              v-else-if="store.isAdmin(channel.name, item.username)"
            >
              Admin
            </div>
          </div>
        </template>
      </v-virtual-scroll>
      <settings-pop-up v-if="store.settingsAdminPopUp"></settings-pop-up>
      <personal-settings
        v-else-if="store.personalPopUpSettings"
      ></personal-settings>
      <v-btn color="red">Leave Group</v-btn>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
