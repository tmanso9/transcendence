<script setup lang="ts">
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CreateChannel from "./CreateChannel.vue";
import { chatAppStore } from "@/store/chat";

const { height } = useDisplay();

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
        :size="height > 700 ? 'large' : 'medium'"
      ></v-icon>
    </div>
    <div class="chatConversations">
      <v-virtual-scroll
        :items="store.allChannelsUserIsIn"
        :height="height > 700 ? 200 : 150"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }">
          <v-list-item
            :key="item.id"
            @click="store.selectChannel(item.name)"
            class="contactElement"
          >
            <template v-slot:prepend>
              <v-icon
                :icon="item.avatar"
                :size="height > 700 ? 'small' : 'x-small'"
              ></v-icon>
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
        :height="height > 700 ? 200 : 150"
        class="contactsScroller"
      >
        <template v-slot:default="{ item }">
          <v-list-item :key="item.id" class="contactElement">
            <div class="contactElement-publicChan">
              <div class="contactElement-publicChan-pofile">
                <v-icon
                  :icon="item.avatar"
                  class="contactElement-publicChan-pofile-avatar"
                  :size="height > 700 ? 'small' : 'x-small'"
                ></v-icon>
                <v-list-item-title v-text="item.name"></v-list-item-title>
              </div>
              <v-btn
                v-if="item.password == 'yes'"
                append-icon="mdi-lock"
                :size="height > 700 ? 'small' : 'x-small'"
                >Join</v-btn
              >
              <v-btn
                v-else-if="item.type == 'personal'"
                :size="height > 700 ? 'small' : 'x-small'"
                >Talk</v-btn
              >
              <v-btn v-else :size="height > 700 ? 'small' : 'x-small'"
                >Join</v-btn
              >
            </div>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </div>
    <create-channel v-if="store.createChannelPopUp"></create-channel>
  </div>
</template>
<style scoped lang="scss"></style>
