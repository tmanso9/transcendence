<script setup lang="ts">
import { createElementBlock, ref } from "vue";
import "./chat.scss";
import { chatAppStore } from "@/store/chat";
import MessageInput from "./messageInput.vue";

// Fake data - TODO(Ask backend for this data) -------------------------------------
const store = chatAppStore();

// --------------------------------------------------------------------------------

const selectedChannel = ref("");

// new channel vars
const type = ref("public");
const password = ref("");
const name = ref("");
const members = ref([]);

function selectChannel(channel: string) {
  selectedChannel.value = channel;
}

function updateScroll(id: string) {
  var element = document.getElementById(id);
  if (element) element.scrollTop = element.scrollHeight;
}
</script>

<template>
  <div class="chatBox">
    <div class="chatBar">
      <div class="chatTopBar">
        <h3>Messages</h3>
        <v-btn icon="mdi-chat-plus"></v-btn>
      </div>
      <div class="chatConversations">
        <v-virtual-scroll
          :items="store.allChannelsUserIsIn"
          height="400"
          class="contactsScroller"
        >
          <template v-slot:default="{ item }">
            <v-list-item
              :key="item.id"
              @click="selectChannel(item.name)"
              class="contactElement"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.avatar"></v-icon>
              </template>
              <v-list-item-title v-text="item.name"></v-list-item-title>
            </v-list-item>
          </template>
        </v-virtual-scroll>
      </div>
    </div>
    <div class="chatMessagesBox" v-if="selectedChannel">
      <div class="channelHeader">
        <v-avatar icon="$vuetify" size="54"></v-avatar>
        {{ selectedChannel }}
      </div>
      <div class="messageScroll">
        <v-virtual-scroll
          :items="store.channelMessages(selectedChannel)"
          height="500"
          id="scrollMessages"
        >
          <template v-slot:default="{ item }">
            <div class="messageSentOrReceived">
              <div
                v-if="item.sender == store.currentUser"
                class="messageChip messageSentByCurrentUser"
              >
                <v-chip size="large" append-icon="">
                  {{ item.content }}
                </v-chip>
                <v-chip
                  size="x-small"
                  prepend-icon=""
                  color="green"
                  class="messageSentByCurrentUser"
                >
                  {{ item.sender }}
                </v-chip>
              </div>
              <div v-else class="messageChip">
                <v-chip size="large" prepend-icon="">
                  {{ item.content }}
                </v-chip>
                <v-chip size="x-small" prepend-icon="" color="green">
                  {{ item.sender }}
                </v-chip>
              </div>
            </div>
          </template>
        </v-virtual-scroll>
      </div>
      <message-input update-scroll="updateScroll"></messageInput>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
