<template>
  <!-- <h3>User stats are here</h3> -->
  <avatar-wrapper :user="user"/>
  <friends-wrapper class="text-center mt-5" :user="user"/>
</template>

<script lang="ts" setup>
import AvatarWrapper from "./Avatar/AvatarWrapper.vue"
import FriendsWrapper from "./Friends/FriendsWrapper.vue";

const props = defineProps(["user"]);
</script>

<style lang="scss">

</style>
