<script setup lang="ts">
import { createElementBlock, ref } from "vue";
import "./chat.scss";
// Fake data - TODO(Ask backend for this data) -------------------------------------

const currentUser = ref("rui");

const allChannelsUserIsIn = ref([
  {
    id: 0,
    creator: "joao",
    type: "public",
    password: "",
    avatar: "mdi-account-cowboy-hat-outline",
    name: "First Channel",
    members: ["joao", "rui", "roberto", "francisco"],
    messages: [
      { sender: "rui", content: "ola a todos" },
      { sender: "joao", content: "ola rui" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
      { sender: "roberto", content: "ola" },
    ],
  },
  {
    id: 1,
    creator: "joao",
    type: "private",
    password: "",
    avatar: "mdi-account-cowboy-hat-outline",
    name: "Second Channel",
    members: ["joao", "rui", "anastacia"],
    messages: [
      { sender: "joao", content: "este é o segundo channel" },
      { sender: "rui", content: "já tinhas criado um joao" },
      { sender: "anastacia", content: "este é o meu primeiro canal" },
      { sender: "joao", content: "mas este é private" },
    ],
  },
  {
    id: 2,
    creator: "rui",
    type: "personal",
    password: "",
    avatar: "mdi-account-cowboy-hat-outline",
    name: "joao",
    members: ["joao", "rui"],
    messages: [
      { sender: "rui", content: "primeira mensagem privada" },
      { sender: "joao", content: "ola rui" },
    ],
  },
]);

const userFriends = ref(["joao", "anastacia"]);

// --------------------------------------------------------------------------------

const selectedChannel = ref("");

// new channel vars
const type = ref("public");
const password = ref("");
const name = ref("");
const members = ref([]);

function selectChannel(channel: string) {
  selectedChannel.value = channel;
}

function createNewChannel(
  creator: string,
  type: string,
  password: string,
  avatar: string,
  name: string,
  members: string[]
) {
  if (
    (type != "personal" && type != "public" && type != "private") ||
    (type == "personal" && members.length > 1)
  )
    return;
  const id = allChannelsUserIsIn.value.length;
  allChannelsUserIsIn.value.push({
    id: allChannelsUserIsIn.value.length,
    creator: creator,
    type: type,
    password: password,
    avatar: avatar,
    name: name,
    members: members,
    messages: [],
  });
}

function channelMessages(channel: any) {
  for (let i = 0; i < allChannelsUserIsIn.value.length; i++) {
    if (allChannelsUserIsIn.value[i].name == channel)
      return allChannelsUserIsIn.value[i].messages;
  }
}

function updateScroll(id: string) {
  var element = document.getElementById(id);
  if (element) element.scrollTop = element.scrollHeight;
}
</script>
<template>
  <div class="chatBox">
    <div class="chatBar">
      <div class="chatTopBar">
        <h3>Messages</h3>
        <v-btn icon="mdi-chat-plus"></v-btn>
      </div>
      <div class="chatConversations">
        <v-virtual-scroll
          :items="allChannelsUserIsIn"
          height="400"
          class="contactsScroller"
        >
          <template v-slot:default="{ item }">
            <v-list-item
              :key="item.id"
              @click="selectChannel(item.name)"
              class="contactElement"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.avatar"></v-icon>
              </template>
              <v-list-item-title v-text="item.name"></v-list-item-title>
            </v-list-item>
          </template>
        </v-virtual-scroll>
      </div>
    </div>
    <div class="chatMessagesBox" v-if="selectedChannel">
      <div class="channelHeader">
        <v-avatar icon="$vuetify" size="54"></v-avatar>
        {{ selectedChannel }}
      </div>
      <div class="messageScroll">
        <v-virtual-scroll
          :items="channelMessages(selectedChannel)"
          height="500"
          id="scrollMessages"
        >
          <template v-slot:default="{ item }">
            <div class="messageSentOrReceived">
              <div
                v-if="item.sender == currentUser"
                class="messageChip messageSentByCurrentUser"
              >
                <v-chip size="large" append-icon="">
                  {{ item.content }}
                </v-chip>
                <v-chip
                  size="x-small"
                  prepend-icon=""
                  color="green"
                  class="messageSentByCurrentUser"
                >
                  {{ item.sender }}
                </v-chip>
              </div>
              <div v-else class="messageChip">
                <v-chip size="large" prepend-icon="">
                  {{ item.content }}
                </v-chip>
                <v-chip size="x-small" prepend-icon="" color="green">
                  {{ item.sender }}
                </v-chip>
              </div>
            </div>
          </template>
        </v-virtual-scroll>
      </div>
      <div class="messageWriteBox">
        <v-text-field label="Write..."></v-text-field>
        <v-btn
          icon="mdi-send"
          class="sendMessageButton"
          @click="updateScroll('scrollMessages')"
        ></v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
