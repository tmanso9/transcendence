<script setup lang="ts">
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
</script>
<template>
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
            @click="store.selectChannel(item.name)"
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
</template>
<style scoped lang="scss"></style>
