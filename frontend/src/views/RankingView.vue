<template>
  <h2>Leaderboard</h2>
  <v-data-table
    :headers="headers"
    :items="orderedUsers()"
    item-key="id"
    class="my-5 mx-auto px-2 leaderboard"
  >
    <template #item.position="{ item }">
      <v-chip :color="getColor(item)">{{ item.position }}</v-chip>
    </template>
    <template #item.username="{ item }">
      <a :href="`/users/${item.username}`" class="leaderboard__username">
        {{ item.username }}
      </a>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import type { User } from "@/types";
import { useUserStore } from "@/stores/user";

const headers = [
  { title: "Position", align: "start", key: "position" },
  { title: "Username", align: "start", key: "username" },
  { title: "Points", align: "start", key: "points" },
  { title: "Wins / Losses", align: "start", key: "record" },
];

const users = ref<User[]>([]);
const loggedUser = useUserStore();

async function getUsers() {
  try {
    const response = await fetch("http://localhost:3000/users");
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
      if (!curr.points) curr.points = 0;
      if (!prev.points) prev.points = 0;
      return curr.points - prev.points;
    })
    .map((user, index) => {
      return {
        ...user,
        position: index + 1,
        record: `${user.wins} / ${user.losses}`,
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

const topTree = (index: number) => ({
  ranking__user__isGold: index === 0,
  ranking__user__isSilver: index === 1,
  ranking__user__isBronze: index === 2,
});

const isUser = (username: string | undefined) => ({
  ranking__user__isUser: username === loggedUser.username,
});

const showExtraRow = computed(() => {
  let show = false;
  const users = orderedUsers();
  const top = users[users.length - 1];
  if (
    top &&
    top.points &&
    loggedUser &&
    loggedUser.points &&
    loggedUser.points < top.points
  ) {
    show = true;
  }
  return show;
});
</script>

<style lang="scss">
.leaderboard {
	width: min(80%, 800px) !important;
  &__username {
    text-decoration: none;
    color: var(--primary);
  }
}

// .ranking {
//   width: 500px;
//   margin: 0 auto;
//   margin-bottom: 30px;

//   &__title {
//     font-weight: bold;
//     font-size: 1.2rem;
//     border: 1px solid white;
//     border-radius: 7px;
//     padding-inline: 10px;
//     padding-block: 7px;
//     margin-bottom: 15px;
//   }

//   &__extra_row {
//     margin-top: 20px;
//   }

//   &__title,
//   &__user {
//     display: grid;
//     grid-template-columns: 1fr 2fr 1fr 2fr;
//     padding-block: 3px;
//     &__position,
//     &__username,
//     &__points,
//     &__victories {
//       text-align: center;
//     }
//   }
//   &__user {
//     &__isGold,
//     &__isSilver,
//     &__isBronze {
//       color: black;
//     }
//     &__isGold {
//       background-color: gold;
//     }
//     &__isSilver {
//       background-color: silver;
//     }
//     &__isBronze {
//       background-color: #cd7f32;
//     }

//     &__isUser {
//       border: 2px dashed gray;
//     }
//   }
// }
</style>
