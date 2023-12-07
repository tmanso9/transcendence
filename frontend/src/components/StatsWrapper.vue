<template>
  <h3>User stats are here</h3>
  <v-img
    width="100"
    :src="avatar"
	@error="avatar = defaultPicture"
    alt="user profile picture"
  />
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { ref, onMounted } from "vue";

const props = defineProps(['user'])
const avatar = ref('')

const defaultPicture = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png'

onMounted(() => {
	console.log(props.user)
	avatar.value = props.user.avatar || defaultPicture
})

//add check to see if user in invalid
</script>
