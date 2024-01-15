<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { onMounted, ref } from "vue";
import PersonalSettings from "./PersonalSettings.vue";
import SettingsPopUp from "./SettingsPopUp.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { Channel } from "../../store/chat";

const store = chatAppStore();
const channelPermission = ref(false);
const { height } = useDisplay();
const password = ref("");

onMounted(async () => {
  if (store.channelStd) {
    channelPermission.value = true;
    password.value = store.channelStd.password;
  }
});
</script>
<template>
  <v-icon
    icon="mdi-cog"
    size="x-small"
    @click="
      () => {
        if (store.channelStd?.type == 'personal') {
          store.channelStd.members.map((member) => {
            if (member.id != store.currentUser?.id)
              store.selectedUserProfile = member;
          });
          store.personalPopUpSettings = true;
        } else store.channelSettings = true;
      }
    "
  ></v-icon>
  <personal-settings
    v-if="store.personalPopUpSettings && store.selectedUserProfile"
  ></personal-settings>
  <div v-else-if="store.channelSettings" class="channelSettings">
    <div class="channelSettings-header">
      <span class="text-h6"
        ><v-icon icon="mdi-cog" size="x-small"></v-icon
        >{{ " " + store.channelStd?.channelName }}
      </span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            store.channelSettings = false;
          }
        "
        :size="height > 700 ? 'large' : 'medium'"
      ></v-icon>
    </div>
    <div class="channelSettings-content">
      <div class="channelSettings-content-profile">
        <v-icon :icon="store.channelStd?.avatar" size="x-large"></v-icon>
      </div>
      <div class="channelSettings-content-info">
        {{ store.channelStd?.type + " - " }}
        {{ store.channelStd?.members.length + " " }}
        members
      </div>
      <v-virtual-scroll
        v-if="store.channelStd"
        :items="store.channelStd.members"
        height="150"
        class="channelSettings-content-users"
      >
        <template v-slot:default="{ item }"
          ><div
            class="channelSettings-content-users-user"
            @click="
              () => {
                store.selectedUserProfile = item;
                if (store.selectedUserProfile?.id == store.currentUser?.id)
                  return;
                if (
                  store.channelStd &&
                  store.currentUser &&
                  store.selectedUserProfile &&
                  store.isAdmin(store.channelStd.id, store.currentUser.id) &&
                  store.channelStd.creator != store.selectedUserProfile.username
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
              v-if="item.username == store.channelStd.creator"
            >
              <v-icon icon="mdi-crown" size="x-small"></v-icon>
              Admin
            </div>
            <div
              class="channelSettings-content-users-user-operator"
              v-else-if="store.isAdmin(store.channelStd.id, item.id)"
            >
              Admin
            </div>
          </div>
        </template>
      </v-virtual-scroll>
      <v-btn
        color="warning"
        @click="
          () => {
            if (store.channelStd?.id) store.leaveChannel(store.channelStd.id);
            store.channelSettings = false;
            store.selectChannel('');
          }
        "
        >Leave Group</v-btn
      >
      <div
        v-if="
          store.channelStd &&
          store.currentUser &&
          store.isAdmin(store.channelStd.id, store.currentUser.id) == true
        "
        style="display: flex; flex-direction: row; margin: 1em 0 0 0"
      >
        <v-text-field v-model="password" variant="outlined"></v-text-field>
        <v-btn
          style="padding: 1.5em 1.25em 2.7em 1.25em"
          text="Change password"
          @click="
            () => {
              if (store.channelStd) {
                password = store.channelStd.password;
              }
            }
          "
        ></v-btn>
      </div>
      <settings-pop-up v-if="store.settingsAdminPopUp"></settings-pop-up>
      <personal-settings
        v-else-if="store.personalPopUpSettings"
      ></personal-settings>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
