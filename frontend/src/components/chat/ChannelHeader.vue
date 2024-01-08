<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import ChannelSettings from "./ChannelSettings.vue";
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { Channel } from "../../store/chat";
import { onMounted } from "vue";

const { height } = useDisplay();
const store = chatAppStore();
const channelPermission = ref(false);
const channel = ref<Channel>();

onMounted(async () => {
  channel.value = store.getChannelInfo(store.selectedChannel);
  if (channel) channelPermission.value = true;
});
</script>
<template>
  <div v-if="channelPermission" class="channelHeader">
    <v-icon
      icon="mdi-arrow-left"
      size="small"
      @click="store.selectChannel('')"
    ></v-icon>
    <div class="channelHeader-profile">
      <v-icon
        :icon="channel?.avatar"
        class="channelHeader-profile-avatar"
      ></v-icon>
      <div>{{ channel?.channelName }}</div>
    </div>
    <channel-settings></channel-settings>
  </div>
</template>
<style scoped lang="scss"></style>
