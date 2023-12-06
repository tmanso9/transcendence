<template>
  <div class="signin border rounded-lg" @click="fetchError = ''">
    <div class="ml-auto mr-2">
      <v-icon @click="emit('signup')">mdi-close</v-icon>
    </div>

    <div class="wrapper mt-4 d-flex flex-column align-center">
      <p class="text-h5">Create an account</p>
      <p v-if="fetchError.length" style="color: red" class="mt-3">
        {{ fetchError }}
      </p>

      <v-form
        @submit.prevent="signup()"
        class="my-4 d-flex flex-column align-center"
      >
        <v-text-field
          size="30"
          v-model="username"
          label="username"
          type="text"
        />
        <v-text-field size="30" v-model="email" label="email" type="email" />
        <v-text-field
          size="30"
          v-model="password"
          label="password"
          type="password"
        />
        <div>
          <v-btn type="submit" class="mx-2">sign up</v-btn>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { defineEmits } from "vue";
import { signin, encodeFormData } from "@/utils";

const emit = defineEmits(["signup", "showSignUp"]);
const email = ref("");
const password = ref("");
const username = ref("");
const authUrl = "http://localhost:3000/auth/";
const fetchError = ref("");

const signup = async () => {
  fetchError.value = "";
  const values = [email, password, username];
  const propertyNames = ["email", "password", "username"];

  const urlEncoded = encodeFormData(values, propertyNames)
  try {
    const data = await signin(urlEncoded, new URL(authUrl + 'signup'));
    console.log("success");
    console.log(data);
    emit("signup");
  } catch (error) {
    if (error instanceof Error) {
      const message = JSON.parse(error.message).message;
      fetchError.value = message instanceof Array ? message[0] : message;
      console.error(message);
    }
  }
};
</script>
