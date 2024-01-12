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
  if (store.channelMessagesVar) openMessages.value = true;
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
</script>
<template>
  <div class="messageScroll" v-if="openMessages">
    <v-virtual-scroll
      v-if="store.channelMessagesVar.length != 0"
      :items="store.channelMessagesVar"
      :height="height > 700 ? 382 : 282"
      id="scrollMessages"
      @vue-updated="updateScroll"
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
            <v-chip>
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
            <v-chip>
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
    <v-virtual-scroll
      v-else
      :items="['No messages']"
      :height="height > 700 ? 400 : 300"
      id="scrollMessages"
    >
      <template v-slot:default="{ item }">
        <div class="messageScroll-noMessages">
          <v-chip size="x-large" color="secondary">
            {{ item }}
          </v-chip>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
</template>
<style scoped lang="scss"></style>
