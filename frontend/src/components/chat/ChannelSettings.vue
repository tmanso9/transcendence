<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { onMounted, ref } from "vue";
import PersonalSettings from "./PersonalSettings.vue";
import SettingsPopUp from "./SettingsPopUp.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { Channel } from "../../store/chat";

const store = chatAppStore();
const channelSettings = ref(false);
const channelPermission = ref(false);
const channel = ref<Channel>();
const { height } = useDisplay();

onMounted(async () => {
  channel.value = store.getChannelInfo(store.selectedChannel);
  if (channel) channelPermission.value = true;
});
</script>
<template>
  <v-icon
    icon="mdi-cog"
    size="x-small"
    @click="
      () => {
        if (channel?.type == 'personal') {
          channel.members.map((member) => {
            if (member.id != store.currentUser?.id)
              store.selectedUserProfile = member;
          });
          store.personalPopUpSettings = true;
        } else channelSettings = true;
      }
    "
  ></v-icon>
  <personal-settings
    v-if="store.personalPopUpSettings && store.selectedUserProfile"
  ></personal-settings>
  <div v-else-if="channelSettings" class="channelSettings">
    <div class="channelSettings-header">
      <span class="text-h6"
        ><v-icon icon="mdi-cog" size="x-small"></v-icon
        >{{ " " + channel?.channelName }}
      </span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            channelSettings = false;
          }
        "
        :size="height > 700 ? 'large' : 'medium'"
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
        :items="channel.members"
        height="150"
        class="channelSettings-content-users"
      >
        <template v-slot:default="{ item }"
          ><div
            class="channelSettings-content-users-user"
            @click="
              () => {
                channel?.members.map((member) => {
                  if (member.id == item.id) store.selectedUserProfile = member;
                });
                if (store.selectedUserProfile?.id == store.currentUser?.id)
                  return;
                if (
                  channel &&
                  store.currentUser &&
                  store.selectedUserProfile &&
                  store.isAdmin(channel.id, store.currentUser.id) &&
                  channel.creator != store.selectedUserProfile.username
                )
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
              v-else-if="store.isAdmin(channel.id, item.id)"
            >
              Admin
            </div>
          </div>
        </template>
      </v-virtual-scroll>
      <v-btn color="warning">Leave Group</v-btn>
      <settings-pop-up v-if="store.settingsAdminPopUp"></settings-pop-up>
      <personal-settings
        v-else-if="store.personalPopUpSettings"
      ></personal-settings>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
