<template>
  <v-expansion-panel class="edit-user__password">
    <v-expansion-panel-title
      expand-icon="mdi-plus"
      collapse-icon="mdi-minus"
      color="grey-darken-3"
    >
      Change password
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <p v-if="hasError" class="text-red text-caption">
        {{ errText }}
      </p>
      <v-form
        @submit.prevent="changePwd()"
        class="d-flex flex-column align-center mt-4"
        ref="pwdForm"
      >
        <v-text-field
          v-model="currentPwd"
          label="Current password"
          :type="hidePwd1 ? 'password' : 'text'"
          class="w-100 edit-user__password__input"
          :autofocus="true"
          required
          :rules="noEmpty"
          validateOn="submit"
          density="compact"
          variant="outlined"
          :append-inner-icon="pwd1Icon"
          @click:append-inner="hidePwd1 = !hidePwd1"
        />
        <v-text-field
          v-model="pwd"
          label="New password"
          :type="hidePwd2 ? 'password' : 'text'"
          class="w-100 edit-user__password__input"
          required
          :rules="noEmpty"
          validateOn="submit"
          density="compact"
          variant="outlined"
          :append-inner-icon="pwd2Icon"
          @click:append-inner="hidePwd2 = !hidePwd2"
        />
        <v-text-field
          v-model="pwdConfirm"
          label="Confirm new password"
          :type="hidePwd3 ? 'password' : 'text'"
          class="w-100 edit-user__password__input"
          required
          :rules="confirmPwdRules"
          validateOn="submit"
          density="compact"
          variant="outlined"
          :append-inner-icon="pwd3Icon"
          @click:append-inner="hidePwd3 = !hidePwd3"
        />
        <div>
          <v-btn type="submit" class="mx-2 bg-deep-purple"
            >Change password</v-btn
          >
        </div>
      </v-form>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { noEmpty, fetchMe, apiURI } from "@/utils";
import { computed } from "vue";
import { ref } from "vue";

const props = defineProps(["cookies"]);
const emit = defineEmits(["changedPWD"]);
const user = useUserStore();

const currentPwd = ref("");
const pwd = ref("");
const pwdConfirm = ref("");
const pwdForm = ref<HTMLFormElement>();
const hasError = ref(false);
const errText = ref("");
const hidePwd1 = ref(true);
const pwd1Type = ref("password");
const hidePwd2 = ref(true);
const pwd2Type = ref("password");
const hidePwd3 = ref(true);
const pwd3Type = ref("password");

const confirmPwdRules = [
  (input: string) => {
    if (input) {
      if (input !== pwd.value) return "Passwords don't match";
      return true;
    }
    return "Required";
  },
];

const pwd1Icon = computed(() => {
  return hidePwd1.value ? "mdi-eye-outline" : "mdi-eye-off-outline";
});

const pwd2Icon = computed(() => {
  return hidePwd2.value ? "mdi-eye-outline" : "mdi-eye-off-outline";
});

const pwd3Icon = computed(() => {
  return hidePwd3.value ? "mdi-eye-outline" : "mdi-eye-off-outline";
});

const handleShowPwd = (pwd: string) => {
  if (pwd === "hidePwd1") {
    hidePwd1.value = !hidePwd1.value;
    pwd1Type.value = hidePwd1.value ? "password" : "text";
  }
};

const changePwd = async () => {
  let isValid = { valid: false };
  if (pwdForm.value) {
    isValid = await pwdForm.value.validate();
    // console.log(isValid);
  }
  if (!isValid.valid) return;
  const path = `${apiURI}/users/change-password`;
  const body = `password=${pwd.value}&currentPwd=${currentPwd.value}`;
  hasError.value = false;
  errText.value = "";
  try {
    const result = await fetch(path, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      credentials: "include",
    });
    currentPwd.value = "";
    pwd.value = "";
    pwdConfirm.value = "";
    if (!result.ok) throw new Error(await result.text());
    await fetchMe(props.cookies, user);
    setTimeout(() => {
      emit("changedPWD", false);
    }, 2000);
    emit("changedPWD", true);
  } catch (error) {
    hasError.value = true;
    if (error instanceof Error)
      errText.value = JSON.parse(error.message).message;
    console.error(error);
  }
};
</script>
