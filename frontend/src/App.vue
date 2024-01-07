<script setup lang="ts">
import { RouterView } from "vue-router";
import ChatWrapper from "@/components/chat/ChatWrapper.vue";
import LoginWrapper from "./components/LoginWrapper.vue";
import SignupWrapper from "./components/SignupWrapper.vue";
import NotificationsWrapper from "./components/Notifications/NotificationsWrapper.vue";
import NavBar from "./components/NavBar.vue";
import { onMounted, ref, inject } from "vue";
import { useUserStore } from "./stores/user";
import { VueCookies } from "vue-cookies";
import router from "./router";
import { fetchMe } from "./utils";
import { chatAppStore } from "./store/chat";
import { io } from "socket.io-client";

const showLogin = ref(false);
const showSignup = ref(false);
const showChat = ref(false);
const showNotifications = ref(false);
const permissionToOpenChat = ref(false);
const chatText = ref("Show chat");
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");
const chatStore = chatAppStore();
chatStore.startConection();
const interval = ref();
const toReload = ref(0);

onMounted(async () => {
  await fetchMe(cookies, user);
  await toggleChatPermission();
  const s = io("http://localhost:3000");
  s.on("connect", () => {
    s.emit("userInfo", user.id);
  });

  s.on("newAlert", async () => {
    await fetchMe(cookies, user);
    toReload.value++;
  });
});

router.beforeEach(async (to, from) => {
  await fetchMe(cookies, user);
  if (interval.value !== null && interval.value !== 0)
    clearInterval(interval.value);
  interval.value = setInterval(
    async () => {
      await fetchMe(cookies, user);
      const now = new Date();
      console.log(user.username, now.toLocaleString());
    },
    15 * 60 * 1000,
  );
  const now = new Date();
  console.log(user.username, now.toLocaleString());
});

const toggleChat = async () => {
  let permissionGranted = await chatStore.checkTokenConection();
  if (permissionGranted) {
    showChat.value = !showChat.value;
    chatText.value = showChat.value ? "Hide chat" : "Show chat";
  }
};

const toggleChatPermission = async () => {
  let permissionGranted = await chatStore.checkTokenConection();
  if (permissionGranted) permissionToOpenChat.value = true;
  else permissionToOpenChat.value = false;
};

const toggleLogin = async () => {
  showLogin.value = !showLogin.value;
  showSignup.value = false;
  await fetchMe(cookies, user);
};

const toggleSignUp = async () => {
  showSignup.value = !showSignup.value;
  await fetchMe(cookies, user);
};

function include() {
  return [document.querySelector(".included")];
}

const handleNotificationResolve = async () => {
  await fetchMe(cookies, user);
};
</script>

<template>
  <v-app>
    <nav-bar
      :user="user"
      :showLogin="showLogin"
      @login="toggleLogin"
      @logout="fetchMe(cookies, user)"
      @notifications="showNotifications = !showNotifications"
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
      <notifications-wrapper
        v-if="showNotifications"
        class="mt-n3 notifications"
        :alerts="user.alerts"
        @notification-resolve="handleNotificationResolve"
        v-click-outside="{
          handler: () => (showNotifications = false),
        }"
      />
      <RouterView :key="`${$route.fullPath}--${user.username}--${toReload}`" />
      <v-spacer class="h-10"></v-spacer>
      <chat-wrapper
        v-if="showChat"
        v-click-outside="{
          handler: () => {
            if (showChat) toggleChat();
          },
          include,
        }"
      />
    </v-main>
    <v-footer
      height="1"
      class="pa-0 included"
      style="z-index: 2"
      v-click-outside="toggleChatPermission()"
    >
      <v-btn
        v-if="permissionToOpenChat"
        class="chat mx-auto"
        @click="toggleChat"
        >{{ chatText }}</v-btn
      >
      <v-btn
        v-else
        class="chat mx-auto"
        @click="toggleChat"
        append-icon="mdi-cancel"
        disabled
        >{{ chatText }}</v-btn
      >
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

.notifications {
  position: absolute;
  z-index: 10000;
  width: 40% !important;
  margin-left: 57.5%;
}
</style>
