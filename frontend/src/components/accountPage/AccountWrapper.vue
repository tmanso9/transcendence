<template>
  <!-- <h3>User stats are here</h3> -->
  <div class="d-flex ma-5 mx-auto w-75 justify-space-around align-center">
    <div
      class="account__header__name-and-status d-flex flex-column align-center mt-n2"
    >
      <h2 class="text-center text-h4 mb-1 text-deep-purple-lighten-3">
        {{ user.username }}
      </h2>
      <v-badge
        class="mb-4"
        :dot="true"
        location="start center"
        offset-x="-15"
        :color="mapColor"
      >
        <p class="account__header__name-and-status__name">{{ user.status }}</p>
      </v-badge>
      <p class="text-button text-deep-purple-lighten-3">
        Rank: <span class="text-white">{{ user.rank }}</span>
      </p>
    </div>
    <v-divider vertical class=""></v-divider>
    <avatar-wrapper :user="user" />
  </div>
  <div
    class="d-flex flex-column flex-sm-row justify-space-evenly mx-auto my-10 account__header__buttons"
  >
    <v-btn
      v-for="button in headerButtons"
      :key="button.text"
      class="mx-auto my-2 my-sm-0 w-25 account__header__buttons__button py-3 d-flex align-center"
      :color="button.color"
    >
      <v-icon>{{ button.icon }}</v-icon>
      <span class="ml-2">{{ button.text }}</span>
    </v-btn>
  </div>
  <v-expansion-panels variant="popout" class="my-5">
    <friends-wrapper class="" :user="user" />
    <stats-wrapper class="" :stats="computedStats" :rank="user.rank" />
    <match-history class="" />
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import AvatarWrapper from "./Avatar/AvatarWrapper.vue";
import FriendsWrapper from "./Friends/FriendsWrapper.vue";
import StatsWrapper from "./Stats/StatsWrapper.vue";
import MatchHistory from "./Stats/MatchHistory.vue";
var a;

const props = defineProps(["user"]);

const computedStats = computed(() => {
  const { wins, losses, points } = props.user;
  return {
    wins: { name: "wins", value: wins },
    losses: { name: "losses", value: losses },
    points: { name: "points", value: points },
  };
});

const mapColor = computed(() => {
  switch (props.user.status) {
    case "online":
      return "success";
    case "offline":
      return "gray";
    default:
      return "deep-purple";
  }
});

const headerButtons = [
  { text: "Chat", icon: "mdi-chat-outline" },
  { text: "Add friend", icon: "mdi-account-plus-outline" },
  { text: "Play pong", icon: "mdi-sword-cross", color: "deep-purple-darken-3" },
];
</script>

<style lang="scss">
.account {
  &__header {
    &__name-and-status {
      &__name {
        font-size: 0.9rem !important;
      }
    }
    &__buttons {
      width: 80%;
      &__button {
        width: 140px !important;
      }
    }
  }
}
</style>
