<script setup lang="ts">
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
</script>
<template>
  <div class="messageScroll">
    <v-virtual-scroll
      :items="store.channelMessages(store.selectedChannel)"
      height="410"
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
              color="primary"
              class="messageSentByCurrentUser"
            >
              {{ item.sender }}
            </v-chip>
          </div>
          <div v-else class="messageChip">
            <v-chip size="large" prepend-icon="">
              {{ item.content }}
            </v-chip>
            <v-chip size="x-small" prepend-icon="" color="primary">
              {{ item.sender }}
            </v-chip>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
</template>
<style scoped lang="scss"></style>
