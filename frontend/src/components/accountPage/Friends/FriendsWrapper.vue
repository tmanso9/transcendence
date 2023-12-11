<template>
  <h2>Friends</h2>
  <div class="friends d-flex">
    <v-card
      v-for="(friend, i) in friends"
      :key="i"
      class="ma-2 w-25 d-flex align-center"
      height="60px"
    >
      <v-avatar size="38px" class="mx-2">
        <v-img :src="user.avatar" alt="friend avatar" />
      </v-avatar>
      {{ friend.username }}
    </v-card>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["user"]);

const friends = props.user?.friends || [];
</script>
