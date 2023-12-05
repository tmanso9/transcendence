<template>
  <main>
    <p v-if="!user.username">Login for all the pong fun</p>
    <p>This is the home page</p>
  </main>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

const user = useUserStore()
</script>
