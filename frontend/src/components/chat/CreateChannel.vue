<script setup lang="ts">
import { ref } from "vue";
import { chatAppStore } from "@/store/chat";
import { count } from "console";
import { User } from "../../store/chat";

const store = chatAppStore();
const newChannelPopUp = ref(false);
const createChannelFinal = ref(false);
const channelIsPublic = ref(false);
const password = ref("");
const channelName = ref("");
</script>
<template>
  <!-- CHOOSE CHANNEL TYPE -->
  <div v-if="!newChannelPopUp" class="createChannelPopUp">
    <div class="createChannelPopUp-header">
      <span class="text-h6">Create Channel</span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            store.createChannelPopUp = false;
          }
        "
      ></v-icon>
    </div>
    <v-virtual-scroll
      :items="[
        { name: 'New Public Channel', avatar: 'mdi-account-group' },
        { name: 'New Private Channel', avatar: 'mdi-account-multiple-plus' },
      ]"
      height="100"
      class="createChannelPopUp-options"
    >
      <template v-slot:default="{ item }">
        <v-list-item
          :key="item.name"
          @click="
            () => {
              if (item.name == 'New Public Channel') channelIsPublic = true;
              else channelIsPublic = false;
              newChannelPopUp = true;
            }
          "
        >
          <template v-slot:prepend>
            <v-icon :icon="item.avatar"></v-icon>
          </template>
          <v-list-item-title v-text="item.name"></v-list-item-title>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </div>
  <!-- CHOOSE CHANNEL MEMBERS -->
  <div v-if="newChannelPopUp" class="createChannelPopUp">
    <div class="createChannelPopUp-header newChannelHeader">
      <span class="text-h6">Participants</span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            if (store.friendsWithTick?.length) {
              for (let i = 0; i < store.friendsWithTick.length; i++) {
                store.friendsWithTick[i].added = false;
              }
            }
            newChannelPopUp = false;
          }
        "
      ></v-icon>
    </div>
    <v-virtual-scroll
      :items="store.friendsWithTick"
      height="200"
      class="createChannelPopUp-friends"
    >
      <template v-slot:default="{ item }">
        <v-list-item
          :key="item.friend.id"
          @click="
            () => {
              if (store.friendsWithTick) {
                const index = store.friendsWithTick
                  .map((n) => n.friend.id)
                  .indexOf(item.friend.id, 0);
                if (index > -1) {
                  store.friendsWithTick[index].added =
                    !store.friendsWithTick[index].added;
                }
              }
            }
          "
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-account"></v-icon>
          </template>
          <v-list-item-title v-text="item.friend.username"></v-list-item-title>
          <v-icon
            v-if="item.added"
            icon="mdi-check-bold"
            color="primary"
            size="x-small"
          ></v-icon>
        </v-list-item>
      </template>
    </v-virtual-scroll>
    <v-btn
      style="float: right; margin-top: 1em"
      color="primary"
      @click="
        () => {
          createChannelFinal = true;
        }
      "
      >Next</v-btn
    >
  </div>
  <!-- CREATE CHANNEL -->
  <div v-if="createChannelFinal" class="createChannelPopUp">
    <div class="createChannelPopUp-header newChannelHeader">
      <span class="text-h6">New Group</span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            createChannelFinal = false;
          }
        "
      ></v-icon>
    </div>
    <v-text-field
      v-model="channelName"
      label="Group Name"
      color="secondary"
      variant="outlined"
    ></v-text-field>
    <v-text-field
      v-if="channelIsPublic"
      v-model="password"
      type="password"
      label="Password (optional)"
      color="secondary"
      variant="outlined"
    ></v-text-field>
    <v-text-field
      v-else
      v-model="password"
      label="Password (optional)"
      color="primary"
      variant="outlined"
      disabled
    ></v-text-field>
    <v-btn
      style="float: right; margin-top: 1em"
      color="primary"
      @click="
        () => {
          let members: User[] = [];
          store.friendsWithTick?.map((user) => {
            if (user.added == true) members.push(user.friend);
          });
          if (channelIsPublic && members.length > 0)
            store.createChannel('public', password, channelName, members);
          else if (members.length > 0)
            store.createChannel('private', '', channelName, members);

          if (store.friendsWithTick?.length) {
            for (let i = 0; i < store.friendsWithTick.length; i++) {
              store.friendsWithTick[i].added = false;
            }
          }
          store.getAllChatData();
          store.createChannelPopUp = false;
          newChannelPopUp = false;
          createChannelFinal = false;
        }
      "
      >Create</v-btn
    >
  </div>
</template>
<style scoped lang="scss"></style>
