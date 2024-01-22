<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import ChatWrapper from "@/components/chat/ChatWrapper.vue";
import LoginWrapper from "./components/LoginWrapper.vue";
import SignupWrapper from "./components/SignupWrapper.vue";
import NotificationsWrapper from "./components/Notifications/NotificationsWrapper.vue";
import NavBar from "./components/NavBar.vue";
import { ref, inject, onMounted } from "vue";
import { useUserStore } from "./store/user";
import { VueCookies } from "vue-cookies";
import router from "./router";
import { fetchMe, apiURI } from "./utils";
import { chatAppStore } from "./store/chat";
import { io } from "socket.io-client";
import { computed } from "vue";

const showLogin = ref(false);
const showSignup = ref(false);
const showNotifications = ref(false);
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");
const chatStore = chatAppStore();
const interval = ref();
const toReload = ref(0);
const ready = ref(false);
const route = useRouter();
const chatText = computed(() => {
  return chatStore.chatOpen ? "Hide chat" : "Show chat";
});

onMounted(async () => {
  await fetchMe(cookies, user);
  await toggleChatPermission();
  if (user.id) {
    const s = io(`${apiURI}/login`);

    s.on("connect", () => {
      s.emit("setOnline", user.id);
    });
  }

  setTimeout(() => {
    ready.value = true;
  }, 2);

  const notifications = io(`${apiURI}/notifications`);
  notifications.on("connect", () => {
    notifications.emit("userInfo", user.id);
  });

  notifications.on("newAlert", async () => {
    await fetchMe(cookies, user);
    if (!user.id || user.status !== "IN_GAME") {
      toReload.value++;
    }
  });

  await chatStore.startConection();
});

router.beforeEach(async () => {
  await fetchMe(cookies, user);
  if (interval.value !== null && interval.value !== 0)
    clearInterval(interval.value);
  interval.value = setInterval(
    async () => {
      await fetchMe(cookies, user);
    },
    15 * 60 * 1000,
  );
});

const toggleChat = async () => {
  let permissionGranted = await chatStore.checkTokenConection();
  if (permissionGranted == 0) {
    chatStore.chatOpen = false;
  }
  if (permissionGranted) {
    chatStore.chatOpen = !chatStore.chatOpen;
  }
  toggleChatPermission();
};

const toggleChatPermission = async () => {
  let permissionGranted = await chatStore.checkTokenConection();
  if (permissionGranted) chatStore.permissionToOpenChat = true;
  else chatStore.permissionToOpenChat = false;
};

const toggleLogin = async () => {
  showLogin.value = !showLogin.value;
  showSignup.value = false;
  await fetchMe(cookies, user);
  await chatStore.getAllChatData();
};

const toggleSignUp = async () => {
  showSignup.value = !showSignup.value;
  await fetchMe(cookies, user);
  await chatStore.getAllChatData();
};

function include() {
  return Array.from(document.querySelectorAll(".included"));
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
      @logout="
        fetchMe(cookies, user);
        route.go(0);
      "
      @notifications="showNotifications = !showNotifications"
      class="navbar included"
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
        @close-notification="showNotifications = false"
        v-click-outside="{
          handler: () => (showNotifications = false),
          include,
        }"
      />
      <RouterView
        :key="`${$route.fullPath}--${user.username}--${toReload}`"
        v-if="ready"
      />
      <v-spacer class="h-10"></v-spacer>
      <chat-wrapper
        v-if="chatStore.chatOpen"
        v-click-outside="{
          handler: () => {
            if (chatStore.chatOpen) toggleChat();
          },
          include,
        }"
      />
    </v-main>
    <v-footer
      height="1"
      class="pa-0 included"
      style="z-index: 2410"
      v-click-outside="toggleChatPermission()"
    >
      <v-btn
        v-if="chatStore.permissionToOpenChat"
        class="chat mx-auto"
        @click="
          () => {
            toggleChat();
          }
        "
        >{{ chatText }}
        <v-badge
          v-if="chatStore.numberOfUnreadMsgs"
          :content="chatStore.numberOfUnreadMsgs"
        >
          <v-icon icon="mdi-bell" size="x-large"></v-icon>
        </v-badge>
      </v-btn>
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
