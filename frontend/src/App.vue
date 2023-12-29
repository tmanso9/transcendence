<script setup lang="ts">
import { RouterView } from "vue-router";
import ChatWrapper from "@/components/chat/ChatWrapper.vue";
import LoginWrapper from "./components/LoginWrapper.vue";
import SignupWrapper from "./components/SignupWrapper.vue";
import NavBar from "./components/NavBar.vue";
import { onMounted, ref, inject } from "vue";
import { useUserStore } from "./stores/user";
import { VueCookies } from "vue-cookies";
import router from "./router";
import { fetchMe } from "./utils";
import { chatAppStore } from "./store/chat";

const showLogin = ref(false);
const showSignup = ref(false);
const showChat = ref(false);
const chatText = ref("Show chat");
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");
const store = chatAppStore();
store.startConection();

onMounted(async () => {
  await fetchMe(cookies, user);
});

router.beforeEach(async (to, from) => {
  await fetchMe(cookies, user);
});

const toggleChat = async () => {
  let permissionGranted = await store.checkTokenConection();
  if (permissionGranted == 1) {
    console.log(permissionGranted);
    showChat.value = !showChat.value;
    chatText.value = showChat.value ? "Hide chat" : "Show chat";
  }
};

const toggleLogin = () => {
  showLogin.value = !showLogin.value;
  showSignup.value = false;
  fetchMe(cookies, user);
};

const toggleSignUp = () => {
  showSignup.value = !showSignup.value;
  fetchMe(cookies, user);
};
</script>

<template>
  <v-app>
    <nav-bar
      :user="user"
      :showLogin="showLogin"
      @login="toggleLogin"
      @logout="fetchMe(cookies, user)"
      class="navbar"
    />
    <div class="loginWrapper" v-if="showLogin" @click.self="showLogin = false">
      <login-wrapper
        @login="toggleLogin"
        @showSignUp="
          showSignup = true;
          showLogin = false;
        "
      />
    </div>
    <div
      class="loginWrapper"
      v-if="showSignup"
      @click.self="showSignup = false"
    >
      <signup-wrapper @signup="toggleSignUp" />
    </div>
    <v-main class="px-5 mt-4 h-75 overflow-y-auto">
      <RouterView :key="`${$route.fullPath}--${user.username}`" />
      <v-spacer class="h-10"></v-spacer>
      <chat-wrapper v-if="showChat" />
    </v-main>
    <v-footer height="1" class="pa-0" style="z-index: 2">
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
