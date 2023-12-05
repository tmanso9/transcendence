// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const chatAppStore = defineStore("chat", () => {
  // Data
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

  const currentUser = ref("rui");

  const selectedChannel = ref("");

  // Functions

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

  function selectChannel(channel: string) {
    selectedChannel.value = channel;
  }

  return {
    allChannelsUserIsIn,
    userFriends,
    currentUser,
    selectedChannel,
    createNewChannel,
    channelMessages,
    selectChannel,
  };
});
