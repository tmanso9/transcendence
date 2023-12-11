<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import ChatWrapper from "@/components/chat/ChatWrapper.vue";
import LoginWrapper from "./components/LoginWrapper.vue";
import SignupWrapper from "./components/SignupWrapper.vue";
import NavBar from "./components/NavBar.vue";
import { onMounted, ref } from "vue";
import { useUserStore } from "./stores/user";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";

const showLogin = ref(false)
const showSignup = ref(false)
const showChat = ref(false);
const chatText = ref("Show chat");
const user = useUserStore();

const cookies = inject<VueCookies>("$cookies");

const fetchUser = async () => {
  const jwt = cookies.get("access_token");
  user.fetchUser(jwt)
};

onMounted(() => {
  fetchUser()
});

const toggleChat = () => {
  showChat.value = !showChat.value;
  chatText.value = showChat.value ? "Hide chat" : "Show chat";
};

const toggleLogin = () => {
  showLogin.value = !showLogin.value;
  showSignup.value = false;
  fetchUser()
};

const toggleSignUp = () => {
  showSignup.value = !showSignup.value;
  fetchUser()
};
</script>

<template>
  <v-app>
    <nav-bar :user="user" :showLogin="showLogin" @login="toggleLogin" @logout="fetchUser" class="navbar" />
	<div class="loginWrapper" v-if="showLogin" @click.self="showLogin = false">
	  <login-wrapper @login="toggleLogin" @showSignUp="showSignup = true; showLogin = false"/>
	</div>
	<div class="loginWrapper" v-if="showSignup" @click.self="showSignup = false">
	  <signup-wrapper @signup="toggleSignUp" />
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
  z-index: 1010;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
}
</style>
