<script setup lang="ts">
import { ref } from "vue";
import CreateChannel from "./CreateChannel.vue";
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
</script>
<template>
  <div class="chatBar">
    <div class="chatTopBar">
      <h3>Chat</h3>
      <v-icon
			v-if="!store.createChannelPopUp"
        @click="
          () => {
            store.createChannelPopUp = true;
          }
        "
        icon="mdi-chat-plus"
        color="primary"
        size="large"
      ></v-icon>
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
          <v-list-item :key="item.id" class="contactElement">
            <div class="contactElement-publicChan">
              <div class="contactElement-publicChan-pofile">
                <v-icon
                  :icon="item.avatar"
                  color="secondary"
                  class="contactElement-publicChan-pofile-avatar"
                ></v-icon>
                <v-list-item-title v-text="item.name"></v-list-item-title>
              </div>
              <v-btn
                v-if="item.password == 'yes'"
                append-icon="mdi-lock"
                size="small"
                color="secondary"
                >Join</v-btn
              >
              <v-btn
                v-else-if="item.type == 'personal'"
                size="small"
                color="secondary"
                >Talk</v-btn
              >
              <v-btn v-else size="small" color="secondary">Join</v-btn>
            </div>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </div>
    <create-channel v-if="store.createChannelPopUp"></create-channel>
  </div>
</template>
<style scoped lang="scss"></style>
