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

export interface Message {
  sender: string;
  content: string;
  date: string;
}

export const chatAppStore = defineStore("chat", () => {
  // conection's variables
  const cookies = inject<VueCookies>("$cookies");
  const socket = io("http://localhost:3000");

  // user's data
  const currentUser = ref<User>();
  const allUsers = ref<User[]>();
  const friendsWithTick = ref<{ friend: User; added: boolean }[]>();
  const publicChannelsUserIsNotIn = ref<Channel[]>();
  const selectedChannel = ref("");
  const channelStd = ref<Channel>();
  const channelMessagesVar = ref<Message[]>([]);

  // condicional variables
  const createChannelPopUp = ref(false);
  const personalPopUpSettings = ref(false);
  const settingsAdminPopUp = ref(false);
  const selectedUserProfile = ref<User>();
  const permissionToOpenChat = ref(false);

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

  async function startConection() {
    socket.on("connect", () => {
      console.log("connection id: ", socket.id);
    });
    socket.on("disconnect", () => {
      socket.close();
      window.location.reload();
    });

    await getAllChatData();

    socket.on("channelMessages", (messages) => {
      channelMessagesVar.value = messages;
    });

    socket.on("createChannel", (num) => {
      getAllChatData();
    });

    socket.on("joinChannel", () => {
      getAllChatData();
    });
  }

  async function getAllChatData() {
    await getUser();
    setupPersonalChannels();
    await getPublicChannelsUserIsNotIn();
    setupFriendsWithTick();
    setupPublicChannelsUserIsNotIn();
  }

  function selectChannel(channel: string) {
    selectedChannel.value = channel;
    if (channel == "") channelStd.value = undefined;
  }

  function setupFriendsWithTick() {
    if (!currentUser.value?.friends) return;
    friendsWithTick.value = [];
    currentUser.value.friends.map((user) => {
      if (!friendsWithTick.value)
        friendsWithTick.value = [{ friend: user, added: false }];
      else friendsWithTick.value.push({ friend: user, added: false });
    });
  }

  function setupPersonalChannels() {
    if (!currentUser.value?.channels) return;
    currentUser.value.channels.map((channel) => {
      if (channel.type == "personal") {
        channel.avatar = "mdi-account";
        channel.members.map((member) => {
          if (member.id != currentUser.value?.id)
            channel.channelName = member.username;
        });
      }
    });
  }

  function setupPublicChannelsUserIsNotIn() {
    if (!currentUser.value?.friends || !publicChannelsUserIsNotIn.value) return;
    let friendsWithChannel: string[] = [];
    currentUser.value.channels.map((channel) => {
      if (channel.type == "personal") {
        channel.members.map((member) => {
          if (member.id != currentUser.value?.id)
            friendsWithChannel.push(member.id);
        });
      }
    });
    currentUser.value.friends.map((friend) => {
      if (
        friendsWithChannel.indexOf(friend.id, 0) == -1 &&
        currentUser.value?.username
      ) {
        publicChannelsUserIsNotIn.value?.push({
          id: "0",
          creator: currentUser.value.username,
          type: "personal",
          avatar: "mdi-account",
          password: "",
          channelName: friend.username,
          members: [currentUser.value, friend],
          messages: [],
          admins: [],
          bannedUsers: [],
        });
      }
    });
  }

  // get data functions

  async function getUser() {
    await socketSend<User>("checkTokenConection", cookies?.get("access_token"))
      .then((user) => {
        currentUser.value = user;
      })
      .catch(() => {
        console.log("chat debug: no acessible current user");
      });
  }

  const getPublicChannelsUserIsNotIn = async () => {
    const token = cookies?.get("access_token");
    if (currentUser.value) {
      const userId = currentUser.value.id;
      await socketSend<Channel[]>("publicChannelsUserIsNotIn", {
        token,
        userId,
      })
        .then((channels) => {
          publicChannelsUserIsNotIn.value = channels;
        })
        .catch(() => {
          console.log("chat debug: no acessible public channels");
        });
    }
  };

  function getChannelInfo(channelId: string) {
    if (!currentUser.value?.channels.length) return undefined;
    const channels: Channel[] = currentUser.value.channels;
    const channelFound = ref<Channel>();
    channels.map((channel) => {
      if (channel.id == channelId) channelFound.value = channel;
    });
    console.log("channel in getInfo: ", channelFound.value?.id);
    return channelFound.value;
  }

  async function channelMessages(
    channelId: string,
    option: "get" | "send",
    message: string,
  ) {
    if (!currentUser.value?.channels.length) return;
    const token = cookies?.get("access_token");
    const userId = currentUser.value.id;
    await socketSend<Message[]>("channelMessages", {
      token,
      option,
      channelId,
      message,
    })
      .then((messages) => {
        channelMessagesVar.value = messages;
      })
      .catch(() => {
        console.log("chat debug: no acessible channel messages");
      });
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

    channel.admins.map((member) => {
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

  // active database functions

  async function joinChannel(channelId: string) {
    if (!currentUser.value) return;
    const token = cookies?.get("access_token");
    const userId = currentUser.value.id;
    await socketSend<Channel[]>("joinChannel", {
      token,
      channelId,
    })
      .then((channels) => {
        getAllChatData();
        return channels;
      })
      .catch(() => {
        console.log("chat debug: no acessible channel messages");
      });
  }

  async function createChannel(
    type: "public" | "private" | "personal",
    password: string,
    channelName: string,
    members: User[],
  ): Promise<string | undefined> {
    if (!currentUser.value) return;
    const token = cookies?.get("access_token");
    const userId = currentUser.value.id;
    await socketSend<string>("createChannel", {
      token,
      type,
      password,
      channelName,
      members,
    })
      .then((channelId) => {
        getAllChatData();
        return channelId;
      })
      .catch(() => {
        console.log("chat debug: no acessible channel messages");
      });
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
    permissionToOpenChat,
    channelMessagesVar,
    channelStd,
    startConection,
    checkTokenConection,
    selectChannel,
    getChannelInfo,
    channelMessages,
    channelMembers,
    isAdmin,
    isBlockedFromChannel,
    getAllChatData,
    joinChannel,
    createChannel,
  };
});
