<template>
  <!-- <h3>User stats are here</h3> -->
  <account-header
    class="d-flex ma-5 mx-auto w-75 justify-space-around align-center"
    :user="user"
  />
  <div
    class="d-flex flex-column flex-sm-row justify-space-evenly mx-auto my-10 account__header__buttons"
    :width="mdAndUp ? '80%' : '100%'"
  >
    <v-btn
      v-for="button in headerButtons"
      :key="button.text"
      :width="buttonSize"
      class="mx-auto my-2 my-sm-0 account__header__buttons__button py-3 d-flex align-center"
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
import { useDisplay } from "vuetify";
import AccountHeader from "./Header/AccountHeader.vue";
import FriendsWrapper from "./Friends/FriendsWrapper.vue";
import StatsWrapper from "./Stats/StatsWrapper.vue";
import MatchHistory from "./Stats/MatchHistory.vue";

const props = defineProps(["user"]);
const { sm, mdAndUp } = useDisplay();

const computedStats = computed(() => {
  const { wins, losses, points } = props.user;
  return {
    wins: { name: "wins", value: wins },
    losses: { name: "losses", value: losses },
    points: { name: "points", value: points },
  };
});

const headerButtons = [
  { text: "Chat", icon: "mdi-chat-outline" },
  { text: "Add friend", icon: "mdi-account-plus-outline" },
  { text: "Play pong", icon: "mdi-sword-cross", color: "deep-purple-darken-3" },
];

const buttonSize = computed(() => {
  return sm.value || mdAndUp.value ? "145px" : "75%";
});
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
}
</style>
