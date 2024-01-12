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

onMounted(async () => {
  console.log("channel: ", store.selectedChannel);
  store.channelStd = store.getChannelInfo(store.selectedChannel);
  if (store.channelStd) channelPermission.value = true;
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
        :icon="store.channelStd?.avatar"
        class="channelHeader-profile-avatar"
      ></v-icon>
      <div>{{ store.channelStd?.channelName }}</div>
    </div>
    <channel-settings></channel-settings>
  </div>
</template>
<style scoped lang="scss"></style>
