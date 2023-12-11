<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { ref } from "vue";

const store = chatAppStore();
const channelSettings = ref(false);
const channel = ref(store.getChannelInfo(store.selectedChannel));
</script>
<template>
  <v-icon
    icon="mdi-cog"
    size="x-small"
    @click="
      () => {
        channelSettings = true;
      }
    "
  ></v-icon>
  <div v-if="channelSettings" class="channelSettings">
    <div class="channelSettings-header">
      <span class="text-h6"
        ><v-icon icon="mdi-cog" size="x-small"></v-icon
        >{{ " " + store.selectedChannel }}
      </span>
      <v-icon
        icon="mdi-close-circle"
        color="primary"
        @click="
          () => {
            channelSettings = false;
          }
        "
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
        :items="channel?.members"
        height="250"
        class="channelSettings-content-users"
      >
        <template v-slot:default="{ item }"
          ><div class="channelSettings-content-users-user">
            {{ item }}
          </div></template
        >
      </v-virtual-scroll>
      <v-btn color="primary">Leave Group</v-btn>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
