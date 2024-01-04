<template>
  <!-- <h3>User stats are here</h3> -->
  <account-header
    class="d-flex ma-5 mx-auto w-75 justify-space-around align-center"
    :account="account"
    :isSelf="isSelf"
  />
  <interact-buttons :account="account" :isSelf="isSelf" />
  <v-expansion-panels
    variant="popout"
    class="my-5 mx-auto"
    :class="mdAndUp ? 'account__panels__md' : ''"
  >
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
import { useDisplay } from "vuetify";
import { useUserStore } from "@/stores/user";

const { mdAndUp } = useDisplay();
const user = useUserStore();

const props = defineProps(["account"]);

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
