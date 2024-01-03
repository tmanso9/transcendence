<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import ChannelSettings from "./ChannelSettings.vue";
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

const { height } = useDisplay();
const store = chatAppStore();
</script>
<template>
  <div class="channelHeader">
    <v-icon
      icon="mdi-arrow-left"
      size="small"
      @click="store.selectChannel('')"
    ></v-icon>
    <div class="channelHeader-profile">
      <v-icon
        :icon="store.getChannelInfo(store.selectedChannel)?.avatar"
        class="channelHeader-profile-avatar"
      ></v-icon>
      <div>{{ store.selectedChannel }}</div>
    </div>
    <channel-settings></channel-settings>
  </div>
</template>
<style scoped lang="scss"></style>
