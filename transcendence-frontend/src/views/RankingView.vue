<template>
  <div>
    <h2>Ranking</h2>
    <div class="ranking">
      <div class="ranking__title">
        <span class="ranking__title__position">Pos.</span>
        <span class="ranking__title__username">Username</span>
        <span class="ranking__title__points">Points</span>
        <span class="ranking__title__victories">Wins / Losses</span>
      </div>
      <leaderboard-card
        class="ranking__user"
        v-for="(user, index) in orderedUsers()"
        :class="[topTree(index), isUser(user.username)]"
        :key="user.id"
        :user="user"
        :index="index"
      ></leaderboard-card>
      <leaderboard-card
        class="ranking__user ranking__extra_row"
        :class="isUser(loggedUser.username)"
        v-if="loggedUser.username && showExtraRow"
        :user="loggedUser"
        :index="25"
      ></leaderboard-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type { User } from '@/types'
import LeaderboardCard from '@/components/LeaderboardCard.vue'
import { useUserStore } from '@/stores/user'

const users = ref<User[]>([])
const loggedUser = useUserStore()

async function getUsers() {
  try {
    const response = await fetch('mock-data/ranking.json')
    if (!response.ok) throw new Error()
    const data = await response.json()
    users.value = data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getUsers()
})

const orderedUsers = (): User[] => {
  return users.value
    .sort(function (prev: User, curr: User) {
      if (!curr.points) curr.points = 0
      if (!prev.points) prev.points = 0
      return curr.points - prev.points
    })
    .slice(0, 4)
}

const topTree = (index: number) => ({
  ranking__user__isGold: index === 0,
  ranking__user__isSilver: index === 1,
  ranking__user__isBronze: index === 2
})

const isUser = (username: string | undefined) => ({
  ranking__user__isUser: username === loggedUser.username
})

const showExtraRow = computed(() => {
  let show = false
  const users = orderedUsers()
  const top = users[users.length - 1]
  if (top && top.points && loggedUser && loggedUser.points && loggedUser.points < top.points) {
    show = true
  }
  return show
})
</script>

<style lang="scss">
.ranking {
  width: 500px;
  margin: 0 auto;
  margin-bottom: 30px;

  &__title {
    font-weight: bold;
    font-size: 1.2rem;
    border: 1px solid white;
    border-radius: 7px;
    padding-inline: 10px;
    padding-block: 7px;
    margin-bottom: 15px;
  }

  &__extra_row {
    margin-top: 20px;
  }

  &__title,
  &__user {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 2fr;
    padding-block: 3px;
    &__position,
    &__username,
    &__points,
    &__victories {
      text-align: center;
    }
  }
  &__user {
    &__isGold,
    &__isSilver,
    &__isBronze {
      color: black;
    }
    &__isGold {
      background-color: gold;
    }
    &__isSilver {
      background-color: silver;
    }
    &__isBronze {
      background-color: #cd7f32;
    }

    &__isUser {
      border: 2px dashed gray;
    }
  }
}
</style>
