<template>
  <!-- <h3>User stats are here</h3> -->
  <v-avatar size="120px">
    <v-img
      :src="avatar"
      @error="avatar = defaultPicture"
      alt="user profile picture"
      cover
    />
  </v-avatar>
  <change-profile-picture />
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import ChangeProfilePicture from './ChangeProfilePicture.vue'
import { ref, onMounted } from "vue";

const props = defineProps(["user"]);
const avatar = ref("");

const defaultPicture =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";

onMounted(() => {
  console.log(props.user);
  avatar.value = props.user.avatar || defaultPicture;
});
//add check to see if user in invalid
</script>

<style lang="scss">
.v-avatar {
	display: block;
	margin: 0 auto 20px;
}
</style>
