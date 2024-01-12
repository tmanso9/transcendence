<template>
  <div v-if="isLoaded">
    <h3>Welcome, {{ user.username }}</h3>
    <p>You can change your username and avatar if you want to</p>
    <div class="w-50 mx-auto my-5">
      <form-change-username :cookies="cookies" />
      <div class="ml-md-10">
        <change-profile-picture
          class="w-100"
          source="firstLogin"
          @avatarChange="goToProfile"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import FormChangeUsername from "@/components/accountPage/Settings/FormChangeUsername.vue";
import ChangeProfilePicture from "@/components/accountPage/Header/ChangeProfilePicture.vue";
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";

const isLoaded = ref(false);
const user = useUserStore();
const router = useRouter();
const cookies = inject<VueCookies>("$cookies");

onBeforeMount(() => {
  if (!user.username) router.push("/");
  else isLoaded.value = true;
});

const goToProfile = () => {
  console.log("aqui");
  router.push(`/users/${user.username}`);
};
</script>

<style lang="scss">
.two-fa {
  width: 300px;
}
</style>
