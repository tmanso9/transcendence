<template>
  <div v-if="isLoaded" class="mx-auto two-fa">
    <h3 class="text-center mb-2 text-button">please enter 2fa code</h3>
    <send-code-form path="authenticate" />
  </div>
</template>

<script lang="ts" setup>
import SendCodeForm from "@/components/accountPage/Settings/SendCodeForm.vue";
import { useUserStore } from "@/stores/user";
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

const isLoaded = ref(false);
const user = useUserStore();
const router = useRouter();

onBeforeMount(() => {
  if (user.username) router.push("/");
  else isLoaded.value = true;
});
</script>

<style lang="scss">
.two-fa {
  width: 300px;
}
</style>
