<template>
  <div
    v-if="!isSelf"
    class="d-flex flex-column flex-sm-row justify-space-evenly mx-auto my-10 account__header__buttons"
    :width="mdAndUp ? '80%' : '100%'"
  >
    <v-btn
      v-for="button in headerButtons"
      :key="button.text"
      :width="buttonSize"
      class="mx-auto my-2 my-sm-0 account__header__buttons__button py-3 d-flex align-center"
      :color="button.color"
    >
      <v-icon>{{ button.icon }}</v-icon>
      <span class="ml-2">{{ button.text }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { useDisplay } from "vuetify";

defineProps(["account", "isSelf"]);
const user = useUserStore();
const { sm, mdAndUp } = useDisplay();

const headerButtons = [
  { text: "Chat", icon: "mdi-chat-outline" },
  { text: "Add friend", icon: "mdi-account-plus-outline" },
  { text: "Play pong", icon: "mdi-sword-cross", color: "deep-purple-darken-3" },
];

const buttonSize = computed(() => {
  return sm.value || mdAndUp.value ? "145px" : "75%";
});
</script>
