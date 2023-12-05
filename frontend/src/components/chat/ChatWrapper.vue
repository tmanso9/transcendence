<script setup lang="ts">
import { ref } from "vue";
import "./chat.scss";
import { chatAppStore } from "@/store/chat";
import MessageInput from "./MessageInput.vue";
import ChatBar from "./ChatBar.vue";
import ChannelHeader from "./ChannelHeader.vue";
import MessagesScroll from "./MessagesScroll.vue";

// Fake data - TODO(Ask backend for this data) -------------------------------------
const store = chatAppStore();

// --------------------------------------------------------------------------------

// new channel vars
const type = ref("public");
const password = ref("");
const name = ref("");
const members = ref([]);

function updateScroll(id: string) {
  var element = document.getElementById(id);
  if (element) element.scrollTop = element.scrollHeight;
}
</script>

<template>
  <div class="chatBox">
    <chat-bar></chat-bar>
    <div class="chatMessagesBox" v-if="store.selectedChannel">
      <channel-header
        :selected-channel="store.selectedChannel"
      ></channel-header>
      <messages-scroll></messages-scroll>
      <message-input
        @scrollMessages="updateScroll('scrollMessages')"
      ></message-input>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
