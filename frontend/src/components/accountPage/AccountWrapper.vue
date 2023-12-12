<template>
  <!-- <h3>User stats are here</h3> -->
  <div class="d-flex ma-5 mx-auto">
    <avatar-wrapper :user="user" />
    <div class="d-flex flex-column w-25 justify-center">
      <v-btn class="my-2 mx-auto w-75 account__header__button">Send message</v-btn>
      <v-btn class="my-2 mx-auto w-75 account__header__button">Add friend</v-btn>
      <v-btn color="deep-purple-darken-3" class="my-2 mx-auto w-75 account__header__button">Challenge</v-btn>
    </div>
  </div>
  <friends-wrapper class="my-5" :user="user" />
</template>

<script lang="ts" setup>
import AvatarWrapper from "./Avatar/AvatarWrapper.vue";
import FriendsWrapper from "./Friends/FriendsWrapper.vue";

const props = defineProps(["user"]);
</script>

<style lang="scss">
.account {
	&__header {
		&__button {
			min-width: 151px;
		}
	}
}
</style>
