<template>
  <main>
    <p>This is the home page</p>
    <p>
      You can try logging in <a href="/auth/login" @click.prevent="login">here</a> (check the
      console for now)
    </p>
  </main>
</template>

<script lang="ts" setup>
const login = () => {
  console.log('Login attempt')
}
</script>
