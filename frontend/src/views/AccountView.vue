<script lang="ts" setup>
import StatsWrapper from '@/components/accountPage/StatsWrapper.vue'
import { ref } from 'vue';
import { onMounted, onBeforeMount } from 'vue';
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchUser } from '@/utils'

const route = useRoute()

const getUsername = computed(() => {
  const path = route.path
  return path.split('/')[2] || 'Please login'
})

const user = ref({})
const isLoaded = ref(false)

onBeforeMount(async () => {
	user.value = await fetchUser(getUsername.value)
	isLoaded.value = true
})

</script>

<template>
  <div>
    <h2>{{ getUsername }}'s account</h2>
    <stats-wrapper v-if="isLoaded" :user="user" />
  </div>
</template>

<style></style>
