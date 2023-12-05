<script setup lang="ts">
import { ref } from "vue";
import { chatAppStore } from "@/store/chat";
import { count } from "console";

const store = chatAppStore();
const newChannelPopUp = ref(false);
const createChannelFinal = ref(false);
</script>
<template>
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
              newChannelPopUp = true;
            }
          "
        >
          <template v-slot:prepend>
            <v-icon :icon="item.avatar" color="primary"></v-icon>
          </template>
          <v-list-item-title v-text="item.name"></v-list-item-title>
        </v-list-item>
      </template>
    </v-virtual-scroll>
    <v-virtual-scroll
      :items="store.friends"
      height="150"
      class="createChannelPopUp-friends"
    >
      <template v-slot:default="{ item }">
        <v-list-item
          :key="item"
          @click="
            () => {
              // TODO
              // - create personal channel with user
              // - select channel
              store.createChannelPopUp = false;
            }
          "
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-account" color="primary"></v-icon>
          </template>
          <v-list-item-title v-text="item"></v-list-item-title>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </div>
  <div v-if="newChannelPopUp" class="createChannelPopUp">
    <div class="createChannelPopUp-header newChannelHeader">
      <span class="text-h6">Participants</span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            for (let i = 0; i < store.friendsWithTick.length; i++) {
              store.friendsWithTick[i].added = false;
            }
            newChannelPopUp = false;
          }
        "
      ></v-icon>
    </div>
    <v-virtual-scroll
      :items="store.friendsWithTick"
      height="300"
      class="createChannelPopUp-friends"
    >
      <template v-slot:default="{ item }">
        <v-list-item
          :key="item.name"
          @click="
            () => {
              const index = store.friendsWithTick
                .map((n) => n.name)
                .indexOf(item.name, 0);
              if (index > -1) {
                store.friendsWithTick[index].added =
                  !store.friendsWithTick[index].added;
              }
            }
          "
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-account" color="primary"></v-icon>
          </template>
          <v-list-item-title v-text="item.name"></v-list-item-title>
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
  <div v-if="createChannelFinal" class="createChannelPopUp">
    <div class="createChannelPopUp-header newChannelHeader">
      <span class="text-h6">Participants</span>
      <v-icon icon="mdi-close-circle" color="primary" @click=""></v-icon>
    </div>
    <v-btn style="float: right; margin-top: 1em" color="primary" @click=""
      >Create</v-btn
    >
  </div>
</template>
<style scoped lang="scss"></style>
