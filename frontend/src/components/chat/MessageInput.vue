<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { ref } from "vue";
import { onMounted } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

const { height } = useDisplay();
const store = chatAppStore();
const canSendMessages = ref(false);
const message = ref("");

onMounted(async () => {
  await store.channelMessages(store.selectedChannel, "get", "");
  if (store.channelMessagesVar) canSendMessages.value = true;
});

async function sendMessage() {
  await store.channelMessages(store.selectedChannel, "send", message.value);

  message.value = "";
}
</script>
<template>
  <div class="messageWriteBox">
    <v-text-field
      v-model="message"
      label="Write..."
      color="secondary"
      variant="outlined"
      append-icon="mdi-send"
      clearable
      :onchange="sendMessage"
    >
    </v-text-field>
  </div>
</template>
<style scoped lang="scss"></style>
