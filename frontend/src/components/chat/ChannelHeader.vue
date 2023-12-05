<script setup lang="ts">
import { chatAppStore } from "@/store/chat";

const store = chatAppStore();
</script>
<template>
  <div class="channelHeader">
    <v-avatar icon="$vuetify" size="54" color="primary"></v-avatar>
    {{ store.selectedChannel }}
  </div>
</template>
<style scoped lang="scss"></style>
