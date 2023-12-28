<template>
  <v-tooltip location="bottom" text="User settings" :attach="true">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="dialog = true"> mdi-cog-outline </v-icon>
      <v-dialog v-model="dialog" class="w-50 text-center">
        <v-card class="py-3 edit-user my-auto">
          <p
            v-if="sent"
            class="text-success mb-n2 text-overline edit-user__2fa__toggle"
          >
            {{ toDisplay }}
          </p>
          <v-expansion-panels
            variant="accordion"
            class="my-5 w-75 mx-auto"
            v-model="panel"
          >
            <v-expansion-panel title="Change username">
              <v-expansion-panel-text>
                <v-form
                  @submit.prevent="console.log('e isso')"
                  class="d-flex flex-column align-center"
                  ref="username-form"
                >
                  <v-text-field
                    v-model="username"
                    label="New username"
                    type="text"
                    class="w-100"
                    autofocus
                  />
                  <div>
                    <v-btn type="submit" class="mt-n3 bg-deep-purple"
                      >Change username</v-btn
                    >
                  </div>
                </v-form>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Change password">
              <v-expansion-panel-text>
                <v-form
                  @submit.prevent="console.log('e isso 2')"
                  class="d-flex flex-column align-center mt-4"
                  ref="pwd-form"
                >
                  <v-text-field
                    v-model="pwd"
                    label="New password"
                    type="password"
                    class="my-n3 w-100"
                    autofocus
                    required
                  />
                  <v-text-field
                    v-model="pwdConfirm"
                    label="Confirm new password"
                    type="password"
                    class="w-100"
                    autofocus
                    required
                  />
                  <div>
                    <v-btn type="submit" class="mx-2 bg-deep-purple"
                      >Change password</v-btn
                    >
                  </div>
                </v-form>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel
              v-if="user.tfa_enabled"
              @group:selected="console.log('disable 2fa')"
              title="disable 2FA"
            >
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

const props = defineProps(["account"]);
const emits = defineEmits(["accountUpdated"]);
const dialog = ref(false);
const username = ref("");
const pwd = ref("");
const pwdConfirm = ref("");
const user = useUserStore();
// change to ref to account value tfa_enabled
const sent = ref(false);
const panel = ref([]);
const cameFromEnabled = ref(true);

const QRSource = ref("");

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
</script>

<style lang="scss">
.edit-user {
  min-height: 300px;
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
