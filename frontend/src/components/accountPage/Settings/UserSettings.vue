<template>
  <v-tooltip location="bottom" text="User settings" :attach="true">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" @click="dialog = true"> mdi-cog-outline </v-icon>
      <v-dialog v-model="dialog" class="text-center edit-user">
        <v-card class="py-10 px-5 edit-user__card my-auto rounded-xl">
          <p
            v-if="sent || changedPWD"
            class="text-success mt-n4 mb-2 text-overline edit-user__2fa__toggle"
          >
            {{ toDisplay }}
          </p>
          <v-expansion-panels
            variant="accordion"
            class="mx-auto edit-user__global rounded-lg"
            v-model="panel"
          >
            <change-username :cookies="cookies" />
            <change-password
              :cookies="cookies"
              @changedPWD="handleChangedPwd"
              v-if="user.loginType === 'REGULAR'"
            />
            <disable2-f-a v-if="user.tfa_enabled" @code-sent="updateAccount" />
            <enable2-f-a v-else @code-sent="updateAccount" />
          </v-expansion-panels>
        </v-card>
      </v-dialog>
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ChangeUsername from "./ChangeUsername.vue";
import ChangePassword from "./ChangePassword.vue";
import Enable2FA from "./Enable2FA.vue";
import Disable2FA from "./Disable2FA.vue";
import { User } from "@/types";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { inject } from "vue";
import { VueCookies } from "vue-cookies";

const emits = defineEmits(["accountUpdated"]);
const dialog = ref(false);
const user = useUserStore();
const sent = ref(false);
const changedPWD = ref(false);
const panel = ref([]);
const cameFromEnabled = ref(true);
const cookies = inject<VueCookies>("$cookies");

const handleChangedPwd = (changed: boolean) => {
  changedPWD.value = changed;
  if (changed) panel.value = [];
};

const toDisplay = computed(() => {
  if (changedPWD.value) return "Password updated";
  return cameFromEnabled.value ? "2FA enabled" : "2FA disabled";
});

const updateAccount = (user: User) => {
  setTimeout(() => {
    sent.value = false;
  }, 3000);
  if (user.tfa_enabled !== undefined) cameFromEnabled.value = user.tfa_enabled;
  emits("accountUpdated", user);
  sent.value = true;
  panel.value = [];
};
</script>

<style lang="scss">
.edit-user {
  min-width: 290px;
  width: 60% !important;
  &__global {
    width: 85% !important;
  }
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
    &__text {
      line-height: 1.3;
    }
  }
}
</style>
