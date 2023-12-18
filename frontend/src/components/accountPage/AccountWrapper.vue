<template>
  <!-- <h3>User stats are here</h3> -->
  <account-header
    class="d-flex ma-5 mx-auto w-75 justify-space-around align-center"
    :account="account"
  />
  <interact-buttons :account="account" />
  <v-expansion-panels variant="popout" class="my-5">
    <friends-wrapper class="" :account="account" />
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

const props = defineProps(["account"]);

const computedStats = computed(() => {
  const { wins, losses, points } = props.account;
  return {
    wins: { name: "wins", value: wins },
    losses: { name: "losses", value: losses },
    points: { name: "points", value: points },
  };
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
