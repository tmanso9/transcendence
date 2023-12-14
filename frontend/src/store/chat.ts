// Utilities
import { defineStore } from "pinia";
import { ref } from "vue";

export const chatAppStore = defineStore("chat", () => {
  // Data

  const friends = ref(["joao", "gonçalo", "joana", "roberto"]);

  const allUsers = ref([
    { id: 0, username: "joao", avatar: "mdi-account-cowboy-hat", blocked: [] },
    {
      id: 1,
      username: "gonçalo",
      avatar: "mdi-account-cowboy-hat",
      blocked: [],
    },
    { id: 2, username: "joana", avatar: "mdi-account-cowboy-hat", blocked: [] },
    {
      id: 3,
      username: "roberto",
      avatar: "mdi-account-cowboy-hat",
      blocked: [],
    },
    { id: 4, username: "rui", avatar: "mdi-account-cowboy-hat", blocked: [] },
    {
      id: 5,
      username: "francisco",
      avatar: "mdi-account-cowboy-hat",
      blocked: [],
    },
    { id: 6, username: "Pedro", avatar: "mdi-account-cowboy-hat", blocked: [] },
    {
      id: 7,
      username: "matilde",
      avatar: "mdi-account-cowboy-hat",
      blocked: [],
    },
    { id: 8, username: "luis", avatar: "mdi-account-cowboy-hat", blocked: [] },
    {
      id: 9,
      username: "anastacia",
      avatar: "mdi-account-cowboy-hat",
      blocked: [],
    },
  ]);

  const friendsWithTick = ref([
    { name: "joao", added: false },
    { name: "gonçalo", added: false },
    { name: "joana", added: false },
    { name: "roberto", added: false },
  ]);

  const publicChannelsUserIsNotIn = ref([
    {
      id: 0,
      creator: "joao",
      type: "public",
      password: "",
      avatar: "mdi-account-group-outline",
      name: "Football",
      members: ["joao", "roberto", "francisco", "gonçalo", "Pedro"],
      admins: ["joao", "roberto"],
      blocked: [],
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
      admins: ["joana", "Pedro", "matilde"],
      blocked: [],
      messages: [
        { sender: "luis", content: "do" },
        { sender: "matilde", content: "re" },
        { sender: "joana", content: "mi" },
        { sender: "Pedro", content: "fa" },
      ],
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
      admins: ["joao", "rui"],
      blocked: [],
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
      admins: [],
      blocked: [],
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
      members: ["joao", "rui", "roberto", "francisco", "anastacia"],
      admins: ["joao", "roberto"],
      blocked: [],
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

  const createChannelPopUp = ref(false);

  const selectedUserProfile = ref<{
    id: number;
    username: string;
    avatar: string;
    blocked: string[];
  }>();

  const personalPopUpSettings = ref(false);

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
      admins: [creator],
      blocked: [],
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

  function getChannelInfo(channel: string) {
    const index = allChannelsUserIsIn.value
      .map((n) => n.name)
      .indexOf(channel, 0);
    if (index > -1) return allChannelsUserIsIn.value[index];
  }

  function channelMembers(channel: string) {
    let memberUsers: { id: number; username: string; avatar: string }[] = [];

    allUsers.value.map((user) => {
      let userIsMember = 0;

      getChannelInfo(channel)?.members.map((mem) => {
        if (mem == user.username) userIsMember = 1;
      });

      if (userIsMember) {
        memberUsers.push(user);
      }

      return true;
    });

    return memberUsers;
  }

  function isAdmin(channelName: string, username: string) {
    let isAdmin = 0;

    allChannelsUserIsIn.value.map((channel) => {
      if (channel.name == channelName) {
        channel.admins.map((admin) => {
          if (admin == username) isAdmin = 1;
        });
      }
    });

    if (isAdmin == 1) return true;
    return false;
  }

  function isBlockedFromChannel(channelName: string, username: string) {
    let isBlockedFromChannel = 0;

    allChannelsUserIsIn.value.map((channel) => {
      if (channel.name == channelName) {
        channel.blocked.map((user) => {
          if (user == username) isBlockedFromChannel = 1;
        });
      }
    });

    if (isBlockedFromChannel == 1) return true;
    return false;
  }

  function findUserByUsername(username: string) {
    const foundedUser = ref<{
      id: number;
      username: string;
      avatar: string;
      blocked: string[];
    }>();
    let foundUser = 0;
    allUsers.value.map((user) => {
      if (user.username == username) foundedUser.value = user;
    });
    if (foundedUser) return foundedUser.value;
    return undefined;
  }

  return {
    friends,
    allUsers,
    publicChannelsUserIsNotIn,
    allChannelsUserIsIn,
    userFriends,
    currentUser,
    selectedChannel,
    createChannelPopUp,
    friendsWithTick,
    personalPopUpSettings,
    selectedUserProfile,
    createNewChannel,
    channelMessages,
    selectChannel,
    getChannelInfo,
    channelMembers,
    isAdmin,
    isBlockedFromChannel,
    findUserByUsername,
  };
});
