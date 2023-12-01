<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import ChatWrapper from "@/components/chat/ChatWrapper.vue";
import { ref } from "vue";

const showChat = ref(false);
const chatText = ref("Show chat");

const toggleChat = () => {
  showChat.value = !showChat.value;
  chatText.value = showChat.value ? "Hide chat" : "Show chat";
};
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="wrapper__nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/play">Play</RouterLink>
        <RouterLink to="/ranking">Ranking</RouterLink>
        <RouterLink to="/me">Account</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
  <div class="chatPopUp">
    <div @click="toggleChat" class="chat-toggle-button">
      <v-icon icon="mdi-forum"></v-icon>
    </div>
    <chat-wrapper v-if="showChat" />
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  &__nav {
    display: flex;
    justify-content: space-around;
    width: 80%;
    margin: 20px auto;
    & a {
      text-decoration: none;
    }
  }
}

.chatPopUp {
  position: fixed;
  margin: 0;
  padding: 0;
  bottom: 1em;
  left: 40em;
}

.chatPopUp > .chat-toggle-button {
  margin: 0;
  padding: 0.5em;
  cursor: pointer;
  text-align: center;
  width: 20em;
  background-color: rgb(1, 55, 40);
  border-radius: 1em 1em 0 0;
}
</style>
