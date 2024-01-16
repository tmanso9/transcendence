<template>
  <v-app-bar>
    <a href="/">
      <v-img
        src="../assets/42.svg"
        width="32"
        aspect-ratio="1"
        contain
        class="mx-4 navbar__ft_logo"
      />
    </a>
    <v-spacer></v-spacer>
    <RouterLink to="/">
      <v-btn
        class="navbar__link"
        :ripple="{ class: 'text-deep-purple-darken-2' }"
      >
        Home
      </v-btn>
    </RouterLink>
    <RouterLink to="/play">
      <v-btn
        class="navbar__link"
        :ripple="{ class: 'text-deep-purple-darken-2' }"
      >
        Play
      </v-btn>
    </RouterLink>
    <RouterLink to="/ranking">
      <v-btn
        class="navbar__link"
        :ripple="{ class: 'text-deep-purple-darken-2' }"
      >
        Leaderboard
      </v-btn>
    </RouterLink>
    <RouterLink v-if="user.username.length" :to="`/users/${user.username}`">
      <v-btn
        class="navbar__link"
        :ripple="{ class: 'text-deep-purple-darken-2' }"
      >
        Account
      </v-btn>
    </RouterLink>
    <RouterLink to="/about">
      <v-btn
        class="navbar__link"
        :ripple="{ class: 'text-deep-purple-darken-2 ' }"
      >
        About
      </v-btn>
    </RouterLink>
    <v-spacer></v-spacer>
    <div class="mr-10">
      <div v-if="user.username">
        <span class="mr-3">hi, {{ user.username }}!</span>
        <v-icon @click="$emit('notifications')" :color="notificationColor">{{
          notificationBell
        }}</v-icon>
        <v-btn class="login" @click="logOut"> Logout </v-btn>
      </div>
      <v-btn class="login" v-else @click="toggleLogin">Login</v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { fetchMe } from "@/utils";
import { computed, inject } from "vue";
import { ref } from "vue";
import { VueCookies } from "vue-cookies";
import { chatAppStore } from "../store/chat";

const props = defineProps(["user"]);
const emit = defineEmits(["login", "logout", "notifications", "chat"]);
const showLogin = ref(false);
const chatStore = chatAppStore();

const cookies = inject<VueCookies>("$cookies");

const notificationBell = computed(() => {
  return props.user.alerts.length
    ? "mdi-bell-badge-outline"
    : "mdi-bell-outline";
});

const notificationColor = computed(() => {
  return notificationBell.value === "mdi-bell-badge-outline"
    ? "deep-purple"
    : "";
});

const toggleLogin = () => {
  emit("login");
};

const logOut = async () => {
  await fetchMe(cookies, props.user);
  await props.user.logout();
  emit("logout");
  chatStore.chatOpen = false;
};
</script>

<style lang="scss">
.navbar {
  &__ft_logo .v-img__img {
    position: relative;
  }
  &__link:active {
    color: white;
  }
}
</style>
