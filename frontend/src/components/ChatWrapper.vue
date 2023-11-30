<script setup lang="ts">
import { createElementBlock, ref } from "vue";
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
      { sender: "rui", content: "primeira mensagme privada" },
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
      <div class="messageScroll">
        <v-virtual-scroll :items="allChannelsUserIsIn" height="500">
        </v-virtual-scroll>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chatBox {
  display: flex;
  flex-direction: row;
  padding: 1em;
}

.chatBox > .chatBar {
  display: flex;
  flex-direction: column;
  min-width: 20em;
  padding: 0.5em;
  border-radius: 1em 0 0 0;
  border-left: solid 0.2em rgb(1, 55, 40);
  border-top: solid 0.2em rgb(1, 55, 40);
  border-right: solid 0.2em rgb(1, 55, 40);
}

.chatBox > .chatMessagesBox {
  display: flex;
  flex-direction: column;
}

.chatBox > .chatBar > .chatTopBar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 1em;
}

.chatBox > .chatBar > .chatTopBar > h3 {
  display: flex;
  align-items: center; /* Vertical alignment */
  justify-content: center;
}

.chatBox > .chatBar > .chatConversations > .contactsScroller {
  background-color: rgb(1, 55, 40);
  border-radius: 1em;
  padding: 1em 0;
}

.chatBox > .chatBar > .chatConversations > .contactsScroller > .contactElement {
  background-color: black;
  padding: 1em;
}
</style>
