<template>
  <span class="ranking__user__position">{{ index + 1 }}</span>
  <a :href="`/users/${user.username}`" class="ranking__user__username">{{ user.username }}</a>
  <span class="ranking__user__points"> {{ user.points }}</span>
  <span class="ranking__user__victories">{{ user.wins }} / {{ user.losses }}</span>
</template>

<script lang="ts" setup>
import type { User } from '@/types'

defineProps<{
  user: User
  index: number
}>()

//TODO: check if user in top 10, change styling
</script>

<style lang="scss">
.ranking__user {
  &__position,
  &__username,
  &__points,
  &__victories {
    background-color: transparent;
    color: inherit;
    text-decoration: none;
  }
}
</style>
