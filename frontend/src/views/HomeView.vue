<template>
  <main>
    <p>This is the home page</p>
  </main>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

const user = useUserStore()
</script>
