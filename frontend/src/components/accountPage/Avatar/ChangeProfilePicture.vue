<template>
  <v-form
    class="change__image d-flex flex-column ml-n5"
    @submit.prevent="upload"
    validate-on="submit"
    ref="form"
  >
    <p class="pl-3 text-overline text-medium-emphasis mb-n4">Change avatar</p>
    <v-file-input
      accept="image/png, image/jpeg, image/bmp"
      placeholder="Chose image"
      :prepend-icon="''"
      prepend-inner-icon="mdi-camera"
      label="Chose image"
      :chips="true"
      density="compact"
      :show-size="true"
      @update:model-value="selectFile"
      :rules="rules"
      :class="inputError ? 'change__image__input my-3' : 'change__image__input mt-3 mb-n3'"
      ref="fileInput"
    ></v-file-input>
    <v-btn color="deep-purple-darken-3" type="submit">Upload</v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const newPicture = ref<File>();
const form = ref<HTMLFormElement>();
const fileInput = ref<HTMLInputElement>();
const inputError = ref(false)

const selectFile = (files: File[]) => {
	if (files !== null) {
		newPicture.value = files[0];
		// console.log(newPicture.value)
		form.value && form.value.resetValidation()
		inputError.value = false
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
		console.log(newPicture.value);

		//to be done after successful post to backend
		//will the file be hosted on BE? will a link to it work on image?
		
		fileInput.value && fileInput.value.reset()
		//TO-DO: reload page on change
	}
};

</script>

<style scoped lang="scss">
.change__image {
  width: 35%;
  margin: 0 auto;
  & label {
	font-size: 2rem !important;
  }
}
</style>