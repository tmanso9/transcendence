<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { ref } from "vue";
import { onMounted } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

const store = chatAppStore();
const { height } = useDisplay();
const openMessages = ref(false);

onMounted(async () => {
  await store.channelMessages(store.selectedChannel);
  if (store.channelMessagesVar) openMessages.value = true;
});
</script>
<template>
  <div class="messageScroll" v-if="openMessages">
    <v-virtual-scroll
      :items="store.channelMessagesVar"
      :height="height > 700 ? 400 : 300"
      id="scrollMessages"
    >
      <template v-slot:default="{ item }">
        <div class="messageSentOrReceived">
          <div
            v-if="
              store.currentUser?.username &&
              item.sender == store.currentUser?.username
            "
            class="messageChip messageSentByCurrentUser"
          >
            <v-chip>
              {{ item.content }}
            </v-chip>
            <v-chip
              size="x-small"
              color="secondary"
              class="messageSentByCurrentUser"
            >
              {{ item.sender }}
            </v-chip>
          </div>
          <div v-else class="messageChip">
            <v-chip>
              {{ item.content }}
            </v-chip>
            <v-chip size="x-small" color="secondary">
              {{ item.sender }}
            </v-chip>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
</template>
<style scoped lang="scss"></style>
