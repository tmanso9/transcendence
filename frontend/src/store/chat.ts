// Utilities
// import { useUserStore } from "@/stores/user";
import { defineStore } from "pinia";
import { Socket, io } from "socket.io-client";
import { ref, onMounted, inject } from "vue";
import { VueCookies } from "vue-cookies";

export interface Channel {
  id: string;
  creator: string;
  type: string;
  avatar: string;
  password: string;
  channelName: string;
  members: User[];
  messages: { sender: string; content: string; date: string }[];
  admins: User[];
  bannedUsers: User[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  status: string;
  avatar: string;
  rank: string;

  points: number;
  wins: number;
  losses: number;

  friends: User[];

  channels: Channel[];
  adminOf: Channel[];
  bannedFrom: Channel[];
}

export const chatAppStore = defineStore("chat", () => {
  // conection's variables
  const cookies = inject<VueCookies>("$cookies");
  const socket = io("http://localhost:3000");

  // user's data
  const currentUser = ref<User>();
  const allUsers = ref<User[]>();
  const friendsWithTick = ref([
    { name: "joao", added: false },
    { name: "gonçalo", added: false },
    { name: "joana", added: false },
    { name: "roberto", added: false },
  ]);
  const publicChannelsUserIsNotIn = ref<Channel[]>();
  const selectedChannel = ref("");

  // condicional variables
  const createChannelPopUp = ref(false);
  const personalPopUpSettings = ref(false);
  const settingsAdminPopUp = ref(false);
  const selectedUserProfile = ref<{
    id: number;
    username: string;
    avatar: string;
    blocked: string[];
  }>();

  // setup conection functions & condicional functions

  function socketSend<T>(event: string, ...args: any[]): Promise<T> {
    return new Promise((r) => socket.emit(event, ...args, r));
  }

  async function checkTokenConection() {
    const payload = socketSend(
      "checkTokenConection",
      cookies?.get("access_token"),
    );
    const isValid = ref(0);
    await payload.then((value) => {
      if (value == 0) isValid.value = 0;
      else isValid.value = 1;
    });
    return isValid.value;
  }

  function startConection() {
    socket.on("connect", () => {
      console.log("connection id: ", socket.id);
    });
    socket.on("disconnect", () => {
      socket.close();
      window.location.reload();
    });

    getUser();
  }

  async function openChat() {}

  function selectChannel(channel: string) {
    selectedChannel.value = channel;
  }

  // get data functions

  async function getUser() {
    await socketSend<User>("checkTokenConection", cookies?.get("access_token"))
      .then((user) => {
        currentUser.value = user;
        console.log(user);
      })
      .catch(() => {
        console.log("chat debug: no acessible current user");
      });
  }

  const getPublicChannelsUserIsNotIn = async () => {
    try {
      const response = await fetch("http://localhost:3000/me/other-channels", {
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      console.log("channels data: ", data);
      publicChannelsUserIsNotIn.value = data;
    } catch (error) {
      console.error(error);
    }
  };

  function getChannelInfo(channelId: string) {
    if (!currentUser.value?.channels.length) return undefined;
    const channels: Channel[] = currentUser.value.channels;
    const channelFound = ref<Channel>();
    channels.map((channel) => {
      if (channel.id == channelId) channelFound.value = channel;
    });
    return channelFound.value;
  }

  function channelMessages(
    channelId: string,
  ): { sender: string; content: string; date: string }[] {
    if (!currentUser.value?.channels.length) return [];
    for (let i = 0; i < currentUser.value.channels.length; i++) {
      if (currentUser.value.channels[i].id == channelId)
        return currentUser.value.channels[i].messages;
    }
    return [];
  }

  function channelMembers(channelId: string) {
    const channel = getChannelInfo(channelId);

    if (channel && channel.members) return channel.members;

    return undefined;
  }

  function isAdmin(channelId: string, userId: string) {
    const channel = getChannelInfo(channelId);
    if (!channel || !channel.members) return false;

    let isAdmin = false;

    channel.members.map((member) => {
      if (member.id == userId) isAdmin = true;
    });

    return isAdmin;
  }

  function isBlockedFromChannel(channelId: string, userId: string) {
    const channel = getChannelInfo(channelId);
    if (!channel || !channel.bannedUsers) return false;

    let isBlockedFromChannel = false;

    channel.bannedUsers.map((member) => {
      if (member.id == userId) isBlockedFromChannel = true;
    });

    return isBlockedFromChannel;
  }

  return {
    currentUser,
    allUsers,
    selectedChannel,
    createChannelPopUp,
    friendsWithTick,
    personalPopUpSettings,
    selectedUserProfile,
    settingsAdminPopUp,
    publicChannelsUserIsNotIn,
    startConection,
    checkTokenConection,
    openChat,
    selectChannel,
    getChannelInfo,
    channelMessages,
    channelMembers,
    isAdmin,
    isBlockedFromChannel,
  };
});
