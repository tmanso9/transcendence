<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ChatWrapper from '@/components/ChatWrapper.vue'
import LoginWrapper from './components/LoginWrapper.vue'
import { ref } from 'vue'
import { useUserStore } from './stores/user'

const showChat = ref(false)
const showLogin = ref(false)
const chatText = ref('Show chat')
const user = useUserStore()

const toggleChat = () => {
  showChat.value = !showChat.value
  chatText.value = showChat.value ? 'Hide chat' : 'Show chat'
}

const toggleLogin = () => {
  showLogin.value = !showLogin.value
}
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="wrapper__nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/play">Play</RouterLink>
        <RouterLink to="/ranking">Ranking</RouterLink>
        <RouterLink v-if="user.username.length" :to="`/users/${user.username}`">Account</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <button class="login" v-if="user.username" @click="user.logout()">Logout</button>
        <button class="login" v-else @click="toggleLogin">Login</button>
      </nav>
    </div>
  </header>

  <div class="loginWrapper" v-if="showLogin" @click.self="showLogin = false">
    <login-wrapper @login="showLogin = false" />
  </div>
  <RouterView />
  <v-btn> Button </v-btn>
  <button class="chat" @click="toggleChat">{{ chatText }}</button>
  <chat-wrapper v-if="showChat" />
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

.chat {
  cursor: pointer;
  margin: 0 auto;
  display: block;
}

.login {
  cursor: pointer;
  border: 0;
}

.loginWrapper {
  width: 100vw;
  height: 100vh;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
}
</style>
