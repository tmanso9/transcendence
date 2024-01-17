<script setup lang="ts">
import { chatAppStore } from "@/store/chat";
import { computed } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

const store = chatAppStore();
const { height } = useDisplay();
const openMessages = ref(false);

onMounted(async () => {
  await store.channelMessages(store.selectedChannel, "get", "");
  if (store.channelMessagesVar) {
    openMessages.value = true;
  }
});

function updateScroll() {
  var element = document.getElementById("scrollMessages");
  if (element) element.scrollTop = element.scrollHeight;
}

function nextValue(index: number) {
  if (index < 0 || index >= store.channelMessagesVar.length) return undefined;
  const nextItem = store.channelMessagesVar[index];
  return nextItem;
}

const mensagens = computed(() => {
  setTimeout(() => updateScroll(), 100);
  return store.channelMessagesVar;
});
</script>
<template>
  <div class="messageScroll" v-if="openMessages">
    <v-virtual-scroll
      :items="mensagens || ['No messages']"
      :height="height > 700 ? 382 : 282"
      id="scrollMessages"
    >
      <template v-slot:default="{ item, index }">
        <div class="messageSentOrReceived">
          <div
            v-if="
              store.currentUser?.username &&
              item.sender == store.currentUser?.username
            "
            class="messageChip messageSentByCurrentUser"
          >
            <v-chip
              style="
                max-width: 15em;
                height: auto !important;
                white-space: normal !important;
                line-height: 1.2;
                border-radius: 1em;
                padding-top: 0.5em;
                padding-bottom: 0.5em;
                text-align: left;
              "
            >
              {{ item.content }}
            </v-chip>
            <v-chip
              v-if="
                nextValue(index + 1)?.sender != item.sender &&
                item.sender != store.currentUser.username
              "
              size="x-small"
              color="secondary"
              class="messageSentByCurrentUser messageChip-messageSentChip"
            >
              {{ item.sender }}
            </v-chip>
          </div>
          <div v-else class="messageChip">
            <v-chip
              style="
                max-width: 12em;
                height: auto !important;
                white-space: normal !important;
                line-height: 1.2;
                border-radius: 1em;
                padding-top: 0.5em;
                padding-bottom: 0.5em;
                text-align: left;
              "
            >
              {{ item.content }}
            </v-chip>
            <v-chip
              v-if="nextValue(index + 1)?.sender != item.sender"
              size="x-small"
              color="secondary"
              class="messageChip-messageSentChip"
            >
              {{ item.sender }}
            </v-chip>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
    <div
      class="messageScroll-noMessages"
      v-if="store.channelMessagesVar.length == 0"
    >
      <v-chip size="x-large" color="secondary"> No messages </v-chip>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
