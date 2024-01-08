<template>
  <account-header
    class="d-flex ma-5 mx-auto w-75 justify-space-around align-center"
    :account="account"
    :isSelf="isSelf"
    @accountUpdated="updateAccount"
  />
  />
  <interact-buttons
    :account="account"
    :isSelf="isSelf"
    :myFriends="myFriends"
    :connections="connections"
    @friend-request="handleFriendRequest"
  />
  <v-expansion-panels
    variant="popout"
    class="my-5 mx-auto"
    :class="mdAndUp ? 'account__panels__md' : ''"
  >
    <friends-wrapper
      class=""
      :account="account"
      @friend-request="handleFriendRequest"
      :isSelf="isSelf"
    />
    <stats-wrapper class="" :stats="computedStats" :rank="account.rank" />
    <match-history class="" />
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import AccountHeader from "./Header/AccountHeader.vue";
import FriendsWrapper from "./Friends/FriendsWrapper.vue";
import StatsWrapper from "./Stats/StatsWrapper.vue";
import MatchHistory from "./Stats/MatchHistory.vue";
import InteractButtons from "./InteractButtons.vue";
import { useDisplay } from "vuetify";
import { useUserStore } from "@/stores/user";
import { User } from "@/types";
import { fetchMe } from "@/utils";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";
import { useRouter } from "vue-router";

const { mdAndUp } = useDisplay();
const user = useUserStore();
const router = useRouter();

const cookies = inject<VueCookies>("$cookies");
const props = defineProps(["account", "myFriends", "connections"]);

const computedStats = computed(() => {
  const { wins, losses, points } = props.account;
  return {
    wins: { name: "wins", value: wins },
    losses: { name: "losses", value: losses },
    points: { name: "points", value: points },
  };
});

const isSelf = computed(() => {
  return user.username && user.username === props.account.username;
});

const updateAccount = async (newUser: User) => {
  //   console.log(newUser);
  await fetchMe(cookies, user);
  // if (newUser.username) user.username = newUser.username
};

const handleFriendRequest = async (path: string, id: string) => {
  try {
    const url = `http://localhost:3000/users/${path}/${id}`;
    const result = await fetch(url, {
      method: "post",
      credentials: "include",
    });
    if (!result.ok) throw new Error(await result.text());
    // const data = await result.text();
    router.go(0);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
</script>

<style lang="scss">
.account {
  &__header {
    &__buttons {
      max-width: 800px;
      &__button {
        min-width: 140px !important;
      }
    }
  }
  &__panels {
    &__md {
      max-width: 1000px;
    }
  }
}
</style>
