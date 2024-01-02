// Utilities
// import { useUserStore } from "@/stores/user";
import { User } from "@/types";
import { Channel } from "../types/channel";
import { defineStore } from "pinia";
import { Socket, io } from "socket.io-client";
import { ref, onMounted, inject } from "vue";
import { VueCookies } from "vue-cookies";

export const chatAppStore = defineStore("chat", () => {
  const cookies = inject<VueCookies>("$cookies");

  const socketOptions = {
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: cookies?.get("access_token"), // 'Bearer h93t4293t49jt34j9rferek...'
        },
      },
    },
  };

  const socket = io("http://localhost:3000", socketOptions);

  function socketSend<T>(event: string, ...args: any[]): Promise<T> {
    return new Promise((r) => socket.emit(event, ...args, r));
  }

  function startConection() {
    socket.on("connect", () => {
      console.log("connection id: ", socket.id);
    });
    socket.on("disconnect", () => {
      socket.close();
      window.location.reload();
    });
  }

  async function openChat() {
    await getPublicChannelsUserIsNotIn();
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

  const friends = ref(["joao", "gonçalo", "joana", "roberto"]);

  const allUsers = ref<User[]>();

  async function getUsers() {
    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) throw new Error();
      const data = await response.json();
      allUsers.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  const friendsWithTick = ref([
    { name: "joao", added: false },
    { name: "gonçalo", added: false },
    { name: "joana", added: false },
    { name: "roberto", added: false },
  ]);

  const getPublicChannelsUserIsNotIn = async () => {
    // const tokenKey = await cookies?.get("access_token");
    // return await socketSend("publicChannelsUserIsNotIn", {
    //   token: tokenKey,
    //   userId: "fc3de202-caef-488b-b877-392396436711",
    // });
    try {
      const response = await fetch("http://localhost:3000/me/other-channels", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: await cookies?.get("access_token"),
        },
        // You can include additional options here if needed
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      publicChannelsUserIsNotIn.value = data;
    } catch (error) {
      console.error(error);
    }
  };

  const publicChannelsUserIsNotIn = ref<Channel[]>();

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

  const settingsAdminPopUp = ref(false);

  // Functions

  function createNewChannel(
    creator: string,
    type: string,
    password: string,
    avatar: string,
    name: string,
    members: string[],
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
    let memberUsers: User[] = [];

    allUsers.value?.map((user) => {
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
    const foundedUser = ref<User>();
    let foundUser = 0;
    allUsers.value?.map((user) => {
      if (user.username == username) foundedUser.value = user;
    });
    if (foundedUser) return foundedUser.value;
    return undefined;
  }

  function testWebSockets() {
    socket.emit("test", "hello server, im frontend");
  }

  return {
    friends,
    allUsers,
    allChannelsUserIsIn,
    userFriends,
    currentUser,
    selectedChannel,
    createChannelPopUp,
    friendsWithTick,
    personalPopUpSettings,
    selectedUserProfile,
    settingsAdminPopUp,
    publicChannelsUserIsNotIn,
    createNewChannel,
    channelMessages,
    selectChannel,
    getChannelInfo,
    channelMembers,
    isAdmin,
    isBlockedFromChannel,
    findUserByUsername,
    testWebSockets,
    startConection,
    checkTokenConection,
    openChat,
  };
});
