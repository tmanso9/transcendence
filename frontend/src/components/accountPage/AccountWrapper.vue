<template>
  <!-- <h3>User stats are here</h3> -->
  <div class="d-flex ma-5 mx-auto w-75 justify-space-around align-center">
    <div class="account__header__name-and-status d-flex flex-column align-center mt-n2">
		<h2 class="text-center text-h4 mb-1">{{ user.username }}</h2>
		<v-badge class="mb-4" :dot="true" location="start center" offset-x="-15" :color="mapColor">
			<p class="account__header__name-and-status__name">{{ user.status }}</p>
		</v-badge>
		<p class="text-button text-deep-purple">Rank: <span class="text-white">{{ user.rank }}</span></p>
	</div>
	<v-divider vertical class=""></v-divider>
    <avatar-wrapper :user="user" />
  </div>
  <div class="d-flex justify-space-evenly mx-auto account__header__buttons">
    <v-btn class="my-2 mx-auto w-25 account__header__buttons_button"
      >Send message</v-btn
    >
    <v-btn class="my-2 mx-auto w-25 account__header__buttons_button">Add friend</v-btn>
    <v-btn
      color="deep-purple-darken-3"
      class="my-2 mx-auto w-25 account__header__buttons_button"
      >Challenge</v-btn
    >
  </div>
  <friends-wrapper class="my-5" :user="user" />
  <stats-wrapper class="my-5" :stats="computedStats" :rank="user.rank" />
  <match-history class="my-5" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import AvatarWrapper from "./Avatar/AvatarWrapper.vue";
import FriendsWrapper from "./Friends/FriendsWrapper.vue";
import StatsWrapper from "./Stats/StatsWrapper.vue";
import MatchHistory from "./Stats/MatchHistory.vue";

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
		case 'online':
			return 'success'
		case 'offline':
			return 'gray'
		default:
			return 'deep-purple'
	}
})
</script>

<style lang="scss">
.account {
  &__header {
	&__name-and-status {
		&__name {
			font-size: .9rem !important;
		}
	}
    &__buttons {
		width: 80%;
		&__button {
			min-width: 151px;
		}
	}
  }
}
</style>
