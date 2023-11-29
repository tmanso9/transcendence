<script lang="ts" setup>
import StatsWrapper from '@/components/StatsWrapper.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const getUsername = computed(() => {
  const path = route.path
  return path.split('/')[2] || 'Please login'
})

//TODO: add fetch request and check for valid username
</script>

<template>
  <div>
    <h2>{{ getUsername }}'s account</h2>
    <stats-wrapper />
  </div>
</template>

<style></style>
