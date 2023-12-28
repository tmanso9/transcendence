<template>
  <v-tooltip location="bottom" text="User settings" :attach="true">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="dialog = true"> mdi-cog-outline </v-icon>
      <v-dialog v-model="dialog" class="w-50 text-center">
        <v-card class="py-3 edit-user my-auto">
          <p
            v-if="sent || changedPWD"
            class="text-success mb-n2 text-overline edit-user__2fa__toggle"
          >
            {{ toDisplay }}
          </p>
          <v-expansion-panels
            variant="accordion"
            class="my-5 w-75 mx-auto"
            v-model="panel"
          >
            <v-expansion-panel
              title="Change username"
              class="edit-user__username"
            >
              <v-expansion-panel-text>
                <p v-if="hasError" class="text-red text-caption">
                  {{ errText }}
                </p>
                <v-form
                  @submit.prevent="patchAccount('username')"
                  class="d-flex flex-column align-center"
                  ref="usernameForm"
                >
                  <v-text-field
                    v-model="username"
                    label="New username"
                    type="text"
                    class="w-100 my-2 edit-user__username__input"
                    autofocus
                    :rules="rules"
                    density="compact"
                    validateOn="submit"
                    variant="outlined"
                  />
                  <div>
                    <v-btn type="submit" class="mt-n3 bg-deep-purple"
                      >Change username</v-btn
                    >
                  </div>
                </v-form>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel
              title="Change password"
              class="edit-user__password"
            >
              <v-expansion-panel-text>
                <v-form
                  @submit.prevent="patchAccount('password')"
                  class="d-flex flex-column align-center mt-4"
                  ref="pwdForm"
                >
                  <v-text-field
                    v-model="currentPwd"
                    label="Current password"
                    type="password"
                    class="w-100 edit-user__password__input"
                    autofocus
                    required
                    :rules="rules"
                    validateOn="submit"
                    density="compact"
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="pwd"
                    label="New password"
                    type="password"
                    class="w-100 edit-user__password__input"
                    required
                    :rules="rules"
                    validateOn="submit"
                    density="compact"
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="pwdConfirm"
                    label="Confirm new password"
                    type="password"
                    class="w-100 edit-user__password__input"
                    required
                    :rules="confirmPwdRules"
                    validateOn="submit"
                    density="compact"
                    variant="outlined"
                  />
                  <div>
                    <v-btn type="submit" class="mx-2 bg-deep-purple"
                      >Change password</v-btn
                    >
                  </div>
                </v-form>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel v-if="user.tfa_enabled" title="disable 2FA">
              <v-expansion-panel-text class="my-2">
                <send-code-form path="turn-off" @codeSent="updateAccount" />
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel
              v-else
              @group:selected="generateCode"
              title="enable 2FA"
            >
              <v-expansion-panel-text>
                <v-img
                  :src="QRSource"
                  alt="generate code"
                  class="edit-user__2fa__code"
                />
                <p class="text-overline mt-n2 mb-1">enter code</p>
                <send-code-form path="turn-on" @codeSent="updateAccount" />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-dialog>
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import SendCodeForm from "./SendCodeForm.vue";
import { User } from "@/types";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";
import { fetchMe } from "@/utils";
import router from "@/router";

const props = defineProps(["account"]);
const emits = defineEmits(["accountUpdated"]);
const dialog = ref(false);
const username = ref("");
const currentPwd = ref("");
const pwd = ref("");
const pwdConfirm = ref("");
const user = useUserStore();
const usernameForm = ref<HTMLFormElement>();
const pwdForm = ref<HTMLFormElement>();
const sent = ref(false);
const changedPWD = ref(false);
const panel = ref([]);
const cameFromEnabled = ref(true);
const cookies = inject<VueCookies>("$cookies");
const hasError = ref(false);
const errText = ref("");

const QRSource = ref("");

const rules = [
  (input: string) => {
    if (input) return true;
    return "Required";
  },
];

const confirmPwdRules = [
  (input: string) => {
    if (input) {
      if (input !== pwd.value) return "Passwords don't match";
      return true;
    }
    return "Required";
  },
];

type Selected = {
  value: Boolean;
};

const editUsername = () => {
  console.log(dialog.value);
  dialog.value = true;
  console.log("oi");
  console.log(dialog.value);
};

const generateCode = async (val: Selected) => {
  if (!val.value || QRSource.value.length) return;
  try {
    const result = await fetch("http://localhost:3000/auth/2fa/generate", {
      credentials: "include",
    });
    //check for errors
    const data = await result.text();
    console.log(data);
    QRSource.value = data;
  } catch (error) {
    console.error(error);
  }
};

const toDisplay = computed(() => {
  if (changedPWD.value) return "Password updated";
  return cameFromEnabled.value
    ? "2FA enabled successfully"
    : "2FA disabled successfully";
});

const updateAccount = (user: User) => {
  setTimeout(() => {
    sent.value = false;
  }, 2000);
  if (user.tfa_enabled !== undefined) cameFromEnabled.value = user.tfa_enabled;
  emits("accountUpdated", user);
  sent.value = true;
  panel.value = [];
};

const patchAccount = async (url: string) => {
  let isValid = { valid: false };
  if (usernameForm.value) {
    isValid = await usernameForm.value.validate();
  } else if (pwdForm.value) {
    isValid = await pwdForm.value.validate();
    console.log(isValid);
  }
  if (!isValid.valid) return;
  const path = `http://localhost:3000/users/change-${url}`;
  const body = `username=${username.value}&password=${pwd.value}&currentPwd=${currentPwd.value}`;
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
    username.value = "";
    if (!result.ok) throw new Error(await result.text());
    const data = await result.json();
    user.username = data.username;
    await fetchMe(cookies, user);
    router.push(`/users/${user.username}`);
    if (url === "password") {
      setTimeout(() => {
        changedPWD.value = false;
      }, 2000);
      changedPWD.value = true;
      panel.value = [];
    }
  } catch (error) {
    hasError.value = true;
    if (error instanceof Error)
      errText.value = JSON.parse(error.message).message;
    console.error(error);
  }
};
</script>

<style lang="scss">
.edit-user {
  min-height: 300px;
  &__username {
    &__input {
      .v-input__details {
        .v-messages {
          &__message {
            margin-top: -5px;
          }
        }
      }
    }
  }
  &__password {
    &__input {
      .v-input__details {
        .v-messages {
          &__message {
            margin-top: -5px;
          }
        }
      }
    }
  }
  &__2fa {
    &__toggle {
      font-size: small !important;
    }
    &__code {
      margin: 10px auto 20px;
      width: 150px;
      height: 150px;
      background-color: grey;
    }
  }
}
</style>
