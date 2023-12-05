// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const chatAppStore = defineStore("chat", () => {
  // Data

  const friends = ref(["joao", "gonçalo", "joana", "roberto"]);

  const publicChannelsUserIsNotIn = ref([
    {
      id: 0,
      creator: "joao",
      type: "public",
      password: "",
      avatar: "mdi-account-group-outline",
      name: "Football",
      members: ["joao", "roberto", "francisco", "gonçalo", "Pedro"],
      messages: [
        { sender: "joao", content: "ola rui" },
        { sender: "roberto", content: "ola" },
        { sender: "gonçalo", content: "hello world" },
        { sender: "Pedro", content: "ola ola" },
      ],
    },
    {
      id: 0,
      creator: "gonçalo",
      type: "public",
      password: "yes",
      avatar: "mdi-account-group-outline",
      name: "Chess Team",
    },
    {
      id: 0,
      creator: "joana",
      type: "public",
      password: "",
      avatar: "mdi-account-group-outline",
      name: "Choir",
      members: ["luis", "joana", "Pedro", "matilde"],
      messages: [
        { sender: "luis", content: "do" },
        { sender: "matilde", content: "re" },
        { sender: "joana", content: "mi" },
        { sender: "Pedro", content: "fa" },
      ],
    },
    {
      id: 5,
      creator: "",
      type: "personal",
      password: "",
      avatar: "mdi-account-cowboy-hat-outline",
      name: "gonçalo",
      members: ["gonçalo", "rui"],
      messages: [],
    },
    {
      id: 7,
      creator: "",
      type: "personal",
      password: "",
      avatar: "mdi-account-cowboy-hat-outline",
      name: "joana",
      members: ["joana", "rui"],
      messages: [],
    },
    {
      id: 8,
      creator: "",
      type: "personal",
      password: "",
      avatar: "mdi-account-cowboy-hat-outline",
      name: "roberto",
      members: ["roberto", "rui"],
      messages: [],
    },
  ]);

  const allChannelsUserIsIn = ref([
    {
      id: 1,
      creator: "joao",
      type: "private",
      password: "",
      avatar: "mdi-account-group-outline",
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
      creator: "",
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
    {
      id: 0,
      creator: "joao",
      type: "public",
      password: "",
      avatar: "mdi-account-group-outline",
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

  // function friendsThatHaveNotTalked() {
  //   let friendsNotTalk = ref<string[]>();
  //   for (let i = 0; i < friends.value.length; i++) {
  //     if (!friendsNotTalk.value) friendsNotTalk.value = [friends.value[i]];
  //     else friendsNotTalk.value.push(friends.value[i]);
  //   }
  //   for (let i = 0; i < allChannelsUserIsIn.value.length; i++) {
  //     if (allChannelsUserIsIn.value[i].type == "personal") {
  //       if (!friendsNotTalk.value) break;
  //       const index = friendsNotTalk.value.indexOf(
  //         allChannelsUserIsIn.value[i].name,
  //         0
  //       );
  //       if (index > -1) friendsNotTalk.value.splice(index, 1);
  //     }
  //   }
  //   if (friendsNotTalk) return friendsNotTalk;
  //   return [];
  // }

  return {
    friends,
    publicChannelsUserIsNotIn,
    allChannelsUserIsIn,
    userFriends,
    currentUser,
    selectedChannel,
    createNewChannel,
    channelMessages,
    selectChannel,
  };
});
