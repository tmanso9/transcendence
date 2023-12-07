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
        ref="form"
      >
        <signin-form-elements
          :isSignUp="true"
          @update-email="(val) => (email = val)"
          @update-password="(val) => (password = val)"
          @update-username="(val) => (username = val)"
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
import { onMounted } from "vue";
import SigninFormElements from "./SigninFormElements.vue";

const emit = defineEmits(["signup", "showSignUp"]);
const email = ref("");
const password = ref("");
const username = ref("");
const authUrl = "http://localhost:3000/auth/";
const fetchError = ref("");
const form = ref(null);

onMounted(() => {
  if (form.value) form.value.focus();
});

async function signup() {
  //frontend validation
  const isValid = await form.value.validate();
  if (!isValid.valid) return;

  fetchError.value = "";
  const values = [email, password, username];
  const propertyNames = ["email", "password", "username"];

  const urlEncoded = encodeFormData(values, propertyNames);
  try {
    const data = await signin(urlEncoded, new URL(authUrl + "signup"));
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
}
</script>
