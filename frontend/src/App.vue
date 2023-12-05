<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import ChatWrapper from "@/components/chat/ChatWrapper.vue";
import LoginWrapper from "./components/LoginWrapper.vue";
import NavBar from "./components/NavBar.vue";
import { ref } from "vue";
import { useUserStore } from "./stores/user";

const showLogin = ref(false)
const showChat = ref(false);
const chatText = ref("Show chat");
const user = useUserStore();

const toggleChat = () => {
  showChat.value = !showChat.value;
  chatText.value = showChat.value ? "Hide chat" : "Show chat";
};

const toggleLogin = () => {
  showLogin.value = !showLogin.value;
};
</script>

<template>
  <v-app>
    <nav-bar :user="user" :showLogin="showLogin" @login="toggleLogin" class="navbar" />
	<div class="loginWrapper" v-if="showLogin" @click.self="showLogin = false">
	  <login-wrapper @login="showLogin = false" />
	</div>
	<v-main class="px-5 mt-4 h-75">
		<RouterView />
		<v-spacer class="h-10"></v-spacer>
		<chat-wrapper v-if="showChat" />
	</v-main>
	<v-footer height="1" class="pa-0">
		<v-btn class="chat mx-auto" @click="toggleChat">{{ chatText }}</v-btn>
	</v-footer>
  </v-app>

</template>

<style lang="scss">
.loginWrapper {
  width: 100vw;
  height: 100vh;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
}
</style>
