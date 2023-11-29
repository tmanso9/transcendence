<template>
  <div class="login">
    <div class="login__first-line">
      <span @click="emit('login')">x</span>
    </div>

    <a class="login__forty-two" href="/auth/42" @click.prevent="login('logging in with 42')">42</a>
    <a class="login__google" href="/auth/google" @click.prevent="login('logging in with google')"
      >Google</a
    >
    <form class="login__email" @submit.prevent="login('logging in with email')">
      <label for="email">Email: </label><input type="email" name="email" id="email" /><br />
      <label for="password">Password: </label
      ><input type="password" name="password" id="password" /><br />
      <button>Log in</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { defineEmits } from 'vue'

const emit = defineEmits(['login'])
const user = useUserStore()

const login = (msg: String) => {
  console.log(msg)
  user.login()
  emit('login')
}
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
  &__first-line {
    margin-left: 100%;
    margin-top: -12px;
    border: 1px solid white;
    border-radius: 80%;
    padding-inline: 4px;
    padding-block: 1px;
  }
  &__email {
    background-color: transparent;
    display: flex;
    flex-direction: column;
    justify-items: baseline;
    margin-top: 25px;
  }
  &__email button {
    cursor: pointer;
    border: 1px solid white;
    padding-inline: 10px;
    padding-block: 3px;
    border-radius: 5px;
  }
  &__email label {
    background-color: transparent;
  }
  &__forty-two,
  &__google {
    display: block;
    width: fit-content;
    text-decoration: none;
    border: 1px solid white;
    padding-inline: 10px;
    padding-block: 3px;
    border-radius: 5px;
    margin-top: 10px;
  }
  &__google {
    background-color: salmon;
    color: black;
  }
}
</style>
