<template>
  <div class="signin border rounded-lg" @click="fetchError = ''">
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
        <v-divider length="45%" class="mx-3"></v-divider>
        <span class="text-caption text-center"> or </span>
        <v-divider length="45%" class="mx-3"></v-divider>
      </div>

      <v-form
        @submit.prevent="login()"
        class="my-4 d-flex flex-column align-center"
        ref="form"
      >
        <signin-form-elements
          :isSignUp="false"
          @update-email="(val) => (email = val)"
          @update-password="(val) => (password = val)"
        />
        <div>
          <v-btn type="submit" class="mx-2">log in</v-btn>
        </div>
      </v-form>
    </div>
    <p class="my-2">
      Don't have an account?
      <span @click="emit('showSignUp')" class="signup">Sign up</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { defineEmits } from "vue";
import { encodeFormData, apiURI } from "@/utils";
import SigninFormElements from "./SigninFormElements.vue";
import { useUserStore } from "@/stores/user";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";
import { useRouter } from "vue-router";

const emit = defineEmits(["login", "showSignUp"]);
const email = ref("");
const password = ref("");
const authUrl = `${apiURI}/auth/`;
const fetchError = ref("");
const form = ref<HTMLFormElement>();
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");
const router = useRouter();

onMounted(() => {
  if (form.value) form.value.focus();
});

const login = async () => {
  //frontend validation
  if (form.value) {
    const isValid = await form.value.validate();
    if (!isValid.valid) return;

    fetchError.value = "";
    const values = [email, password];
    const propertyNames = ["email", "password"];

    const urlEncoded = encodeFormData(values, propertyNames);
    try {
      const data = await user.signin(urlEncoded, new URL(authUrl + "login"));
      if (cookies?.get("access_token") === null) {
        console.log(data);
        user.email = data.email;
        emit("login");
        router.push("/2fa");
      } else {
        emit("login");
      }
    } catch (error) {
      if (error instanceof Error) {
        const message = JSON.parse(error.message).message;
        fetchError.value = message instanceof Array ? message[0] : message;
        console.error(message);
      }
    }
  }
};
</script>

<style lang="scss">
.signin {
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

.signup {
  cursor: pointer;
  text-decoration: underline;
}
</style>
