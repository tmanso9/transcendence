<template>
  <p v-if="error" class="text-red py-3">{{ errText }}</p>
  <div class="w-25">
    <send-code-form
      path="authenticate"
      @error="handleError"
      @clearError="resetForm"
    />
  </div>
</template>

<script lang="ts" setup>
import SendCodeForm from "@/components/accountPage/Settings/SendCodeForm.vue";
import { ref } from "vue";

const error = ref(false);
const errText = ref("");

const handleError = (err: string) => {
  error.value = true;
  errText.value = err;
};

const resetForm = () => {
  error.value = false;
  errText.value = "";
};
</script>
