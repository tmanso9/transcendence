<template>
  <div>
    <h2>Friends</h2>
    <div class="friends d-flex">
      <v-card
        v-for="(friend, i) in friends"
        :key="i"
        class="ma-2 w-25 d-flex align-center friends__card"
        height="60px"
        :href="`/users/${friend.username}`"
      >
        <v-avatar size="45px" class="mx-2">
          <v-img :src="friend.avatar" alt="friend avatar" cover />
        </v-avatar>
        {{ friend.username }}
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["user"]);

const friends = props.user?.friends || [];
</script>

<style lang="scss">
.friends {
	&__card {
		max-width: 200px !important;
	}
}
</style>