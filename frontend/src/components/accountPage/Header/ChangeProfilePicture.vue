<template>
  <v-form
    class="change__image d-flex flex-column mx-auto ml-md-n5 mt-md-4"
    :class="mdAndUp ? '' : 'change__image__mobile'"
    @submit.prevent="upload"
    validate-on="submit"
    ref="form"
  >
    <p class="pl-3 text-overline text-medium-emphasis mb-n4">Change avatar</p>
    <v-file-input
      accept="image/png, image/jpeg, image/bmp"
      :prepend-icon="''"
      prepend-inner-icon="mdi-camera"
      label="Choose image"
      :chips="true"
      density="compact"
      :show-size="true"
      @update:model-value="selectFile"
      :rules="rules"
      class="change__image__input"
      :class="inputError ? 'my-3' : 'mt-3 mb-n3'"
      ref="fileInput"
      :key="fileInputKey"
    ></v-file-input>
    <v-btn color="deep-purple-darken-3" type="submit">Upload</v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/user";
import { apiURI, fetchMe } from "@/utils";
import { inject } from "vue";
import { ref } from "vue";
import { VueCookies } from "vue-cookies";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const { mdAndUp } = useDisplay();

const props = defineProps(["source"]);
const emit = defineEmits(["avatarChange"]);
const user = useUserStore();
const cookies = inject<VueCookies>("$cookies");

const newPicture = ref<Blob | string>("");
const form = ref<HTMLFormElement>();
const fileInput = ref<HTMLInputElement>();
const inputError = ref(false);
const fileInputKey = ref(0);
const router = useRouter();

const selectFile = (files: File[]) => {
  if (files !== null) {
    newPicture.value = files[0];
    form.value && form.value.resetValidation();
    inputError.value = false;
  }
};

const rules = [
  (input: File[]) => {
    if (input !== null && input.length > 0) return true;
    return "Please chose an image";
  },
];

const upload = async () => {
  if (form.value) {
    const isValid = await form.value.validate();
    if (!isValid.valid) {
      inputError.value = true;
      return;
    }
    const formData = new FormData();
    const name = (newPicture.value as File).name;
    formData.append("avatar", newPicture.value as File, name);

    try {
      await fetchMe(cookies, user);
      const response = await fetch(`${apiURI}/users/change-avatar`, {
        method: "post",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error(await response.text());
      emit("avatarChange");
      if (props.source !== "firstLogin") router.go(0);
    } catch (error) {
      console.error(error);
    }

    //to re-render the file input element after upload
    fileInputKey.value++;
  }
};
</script>

<style scoped lang="scss">
.change__image {
  width: 50%;
  &__mobile {
    width: 100%;
    min-width: 140px !important;
  }
}
</style>
