<template>
  <div class="login border rounded-lg" @click="fetchError=''">
    <div class="ml-auto mr-2">
      <v-icon @click="emit('login')">mdi-close</v-icon>
    </div>

    <div class="wrapper mt-4 d-flex flex-column align-center">
      <a :href="authUrl + 'forty-two'" class="my-2">
        <v-btn width="200">Login with 42</v-btn>
      </a>
      <a :href="authUrl + 'google'" class="my-2">
        <v-btn width="200" color="red">Login with Google</v-btn>
      </a>

      <p v-if="fetchError.length" style="color: red" class="mt-3">
        {{ fetchError }}
      </p>
      <div style="width: 200px" class="d-flex align-center mt-3">
        <hr
          width="30%"
          height="1"
          class="border mx-3"
          style="color: rgb(20, 19, 19)"
        />
        <span class="text-caption text-center"> or </span>
        <hr
          width="30%"
          height="1"
          class="border mx-3"
          style="color: rgb(20, 19, 19)"
        />
      </div>

      <v-form
        @submit.prevent="signin(action)"
        class="my-4 d-flex flex-column align-center"
      >
        <v-text-field size="30" v-model="email" label="email" type="email" />
        <v-text-field
          size="30"
          v-model="password"
          label="password"
          type="password"
        />
        <div>
          <v-btn type="submit" class="mx-2" @click="action = 'login'"
            >log in</v-btn
          >
          <v-btn type="submit" class="mx-2" @click="action = 'signup'"
            >sign up</v-btn
          >
        </div>
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
const email = ref("o@b.com");
const password = ref("12345");
const authUrl = "http://localhost:3000/auth/";
const action = ref("login");
const fetchError = ref("");

const signin = async (path: String) => {
  fetchError.value = "";
  let formData: String[] = [];
  formData.push(
    encodeURIComponent("email") + "=" + encodeURIComponent(email.value)
  );
  formData.push(
    encodeURIComponent("password") + "=" + encodeURIComponent(password.value)
  );

  console.log(path);
  const urlEncoded = formData.join("&");
  try {
    const result = await fetch(authUrl + path, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlEncoded,
      credentials: "include",
    });
    if (!result.ok) {
      const err = await result.text();
      throw new Error(err);
    }
    const data = await result.json();
    console.log("success");
    console.log(data);
    emit("login");
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      fetchError.value = JSON.parse(message).message;
      console.error(message);
    }
  }
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
