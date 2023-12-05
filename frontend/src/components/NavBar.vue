<template>
  <v-app-bar class="">
	<a href="https://profile.intra.42.fr/" target="_blank">
		<v-img
		  src="../assets/42.svg"
		  width="32"
		  aspect-ratio="1"
		  contain
		  class="mx-4 navbar__ft_logo"
		/>
	</a>
	<v-spacer></v-spacer>
    <RouterLink to="/">
      <v-btn> Home </v-btn>
    </RouterLink>
    <RouterLink to="/play">
      <v-btn> Play </v-btn>
    </RouterLink>
    <RouterLink to="/ranking">
      <v-btn> Leaderboard </v-btn>
    </RouterLink>
    <RouterLink v-if="user.username.length" :to="`/users/${user.username}`">
      <v-btn> Account </v-btn>
    </RouterLink>
    <RouterLink to="/about">
      <v-btn> About </v-btn>
    </RouterLink>
	<v-spacer></v-spacer>
	<div v-if="user.username" >
		<span>hi, {{ user.username }}</span>
		<v-btn class="login" @click="logOut()">
		  Logout
		</v-btn>
	</div>
    <v-btn class="login" v-else @click="toggleLogin">Login</v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { ref } from "vue";

const props = defineProps(["user"]);
const emit = defineEmits(["login"]);
const showLogin = ref(false);

const cookies = inject('$cookies')

const toggleLogin = () => {
  emit("login");
};

//to be changed to use backend endpoint
const logOut = () => {
	cookies.remove('access_token')
	props.user.logout()
}
</script>

<style lang="scss">
.navbar {
  &__ft_logo .v-img__img {
    position: relative;
  }
}
</style>
