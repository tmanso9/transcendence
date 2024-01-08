<script setup lang="ts">
import { onMounted, ref } from "vue";
import "./chat.scss";
import { chatAppStore } from "@/store/chat";
import MessageInput from "./MessageInput.vue";
import ChatBar from "./ChatBar.vue";
import ChannelHeader from "./ChannelHeader.vue";
import MessagesScroll from "./MessagesScroll.vue";
import CreateChannel from "./CreateChannel.vue";

// Fake data - TODO(Ask backend for this data) -------------------------------------
const store = chatAppStore();

// --------------------------------------------------------------------------------

// new channel vars
const type = ref("public");
const password = ref("");
const name = ref("");
const members = ref([]);
const haveAllInfoNeeded = ref(false);



onMounted(async () => {
  await store.getAllChatData();
  if (store.currentUser && store.publicChannelsUserIsNotIn)
    haveAllInfoNeeded.value = true;
});
</script>

<template>
  <div v-if="haveAllInfoNeeded" class="chatBox">
    <chat-bar v-if="store.selectedChannel == ''"></chat-bar>
    <div class="chatMessagesBox" v-if="store.selectedChannel">
      <channel-header
        :selected-channel="store.selectedChannel"
      ></channel-header>
      <messages-scroll></messages-scroll>
      <message-input
        style="bottom: 0"
      ></message-input>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
