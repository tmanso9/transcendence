<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Chat from '@/components/Chat.vue'
import { ref } from 'vue'

const showChat = ref(false)
const chatText = ref('Show chat')

const toggleChat = () => {
  showChat.value = !showChat.value
  chatText.value = showChat.value ? 'Hide chat' : 'Show chat'
}
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
  <button @click="toggleChat">{{ chatText }}</button>
  <Chat v-if="showChat" />
</template>

<style scoped lang="scss">
.wrapper {
  &__nav {
    display: flex;
    justify-content: space-around;
    width: 80%;
    margin: 20px auto;
  }
}
</style>
