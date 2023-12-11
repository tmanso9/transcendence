<template>
  <!-- <h3>User stats are here</h3> -->
  <avatar-wrapper :user="user"/>
</template>

<script lang="ts" setup>
import AvatarWrapper from "./Avatar/AvatarWrapper.vue"

const props = defineProps(["user"]);
</script>

<style lang="scss">

</style>
