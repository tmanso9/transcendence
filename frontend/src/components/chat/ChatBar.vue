<script setup lang="ts">
import CreateChannel from "./CreateChannel.vue";
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
</script>
<template>
  <div class="chatBar">
    <div class="chatTopBar">
      <h3>Chat</h3>
      <create-channel></create-channel>
    </div>
    <div class="chatConversations">
      <v-virtual-scroll
        :items="store.allChannelsUserIsIn"
        height="200"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }">
          <v-list-item
            :key="item.id"
            @click="store.selectChannel(item.name)"
            class="contactElement"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.avatar" color="primary"></v-icon>
            </template>
            <v-list-item-title v-text="item.name"></v-list-item-title>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </div>
    <div class="chatTopBar">
      <h4>Public Channels</h4>
    </div>
    <div class="chatConversations">
      <v-virtual-scroll
        :items="store.publicChannelsUserIsNotIn"
        height="200"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }">
          <v-list-item
            :key="item.id"
            @click="store.selectChannel(item.name)"
            class="contactElement"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.avatar" color="primary"></v-icon>
              <v-icon
                v-if="item.password == 'yes'"
                icon="mdi-lock"
                size="x-small"
                color="primary"
              ></v-icon>
            </template>
            <v-list-item-title v-text="item.name"></v-list-item-title>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
