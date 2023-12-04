<template>
  <div class="login border rounded-lg">
    <div class="ml-auto mr-2">
		<v-icon @click="emit('login')">mdi-close</v-icon>
    </div>

	<div class="wrapper mt-4 d-flex flex-column align-center">
		<a href="/auth/42" @click.prevent="login('logging in with 42')" class="my-2">
		  <v-btn width="100">42</v-btn>
		</a>
		<a href="/auth/google" @click.prevent="login('logging in with google')" class="my-2">
		  <v-btn width="100" color="red">Google</v-btn>
		</a>
		<v-form @submit.prevent="login('logging in with email')" class="my-4 d-flex flex-column align-center">
			<v-text-field size="30" v-model="email" label="email" />
			<v-text-field size="30" v-model="password" label="password" />
			<v-btn type="submit" class="">log in</v-btn>
		</v-form>
	</div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { defineEmits } from "vue";

const emit = defineEmits(["login"]);
const user = useUserStore();
const email = ref('')
const password = ref('')

const login = (msg: String) => {
  console.log(msg);
  user.login();
  emit("login");
};
</script>

<style scoped lang="scss">
.login {
  z-index: 10;
  width: min(60%, 400px);
  background-color: rgb(20, 19, 19);
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-inline: auto;
  top: 75px;
}
</style>
