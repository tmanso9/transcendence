<template>
  <h2>Leaderboard</h2>
  <v-data-table
    :headers="headers"
    :items="orderedUsers()"
    item-key="id"
    class="my-5 mx-auto px-2 leaderboard"
  >
    <template #[`item.position`]="{ item }">
      <v-chip :color="getColor(item)">{{ item.position }}</v-chip>
    </template>
    <template #[`item.username`]="{ item }">
      <a :href="`/users/${item.username}`" class="leaderboard__username">
        {{ item.username }}
      </a>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { User } from "@/types";
import type { VDataTable } from "vuetify/components";
import { apiURI } from "@/utils";

type ReadOnlyHeaders = VDataTable["headers"];
const headers: ReadOnlyHeaders = [
  { title: "Position", align: "start", key: "position" },
  { title: "Username", align: "start", key: "username" },
  { title: "Points", align: "start", key: "points" },
  { title: "Wins / Losses", align: "start", key: "record" },
];

const users = ref<User[]>([]);

async function getUsers() {
  try {
    const response = await fetch(`${apiURI}/users`);
    if (!response.ok) throw new Error();
    const data = await response.json();
    users.value = data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  getUsers();
});

const orderedUsers = (): User[] => {
  return users.value
    .sort(function (prev: User, curr: User) {
      if (!curr.gamestats?.points) curr.gamestats!.points = 0;
      if (!prev.gamestats?.points) prev.gamestats!.points = 0;
      return curr.gamestats!.points - prev.gamestats!.points;
    })
    .map((user, index) => {
      return {
        position: index + 1,
        username: user.username,
        points: user.gamestats?.points,
        record: `${user.gamestats?.wins} / ${user.gamestats?.losses}`,
      };
    });
};

const getColor = (user: User) => {
  switch (user.position) {
    case 1:
      return "yellow";
    case 2:
      return "inherit";
    case 3:
      return "orange-lighten-1";
    default:
      return "grey-darken-1";
  }
};
</script>

<style lang="scss">
.leaderboard {
  width: min(80%, 800px) !important;
  &__username {
    text-decoration: none;
    color: var(--primary);
  }
}
</style>
