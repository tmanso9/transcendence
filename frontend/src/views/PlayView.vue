<script setup lang="ts">
import {ref, onMounted, nextTick, onUnmounted, Ref} from "vue";
import { Socket } from "socket.io-client";
import router from "@/router";
import {connectSocket, disconnectSocket} from "@/utils/socket/socketManager";
import {useDisplay} from "vuetify";
import {useUserStore} from "@/stores/user";

const {mdAndDown} = useDisplay();
const width = mdAndDown.value ? 500 : 1000;
const height = mdAndDown.value ? 350 : 700;

const user = useUserStore();

const roomsList: Ref<string[]> = ref([]);
let s: Socket = null as any;
router.beforeEach((to, from, next) => {
  if (to.path !== "/game") {
    disconnectSocket();
  }
  next();
});
function goToGame() {
  s.emit("createRoom", {room: "room" +roomsList.value.length.toString(), width: width, height: height});
  router.push("/game");
}


onMounted(async () => {
  await nextTick();
  s = connectSocket(user.id, user.username);
  if (s) {
    s.on("availableRooms", (rooms: string[]) => {
      roomsList.value = rooms;
    });
  }
});

function joinRoom(room: string) {
  s.emit("joinRoom", room);
  router.push("/game");
}


</script>

<template>
  <div v-if="roomsList.length > 0">
    <h1>Available Rooms</h1>
    <div v-for="room in roomsList" :key="room">
      <v-btn variant="outlined" color="white" @click="joinRoom(room)" style="margin: 10px">
        Join {{room}}
      </v-btn>
    </div>
  </div>
  <h1 v-else>No rooms available</h1>
  <v-btn variant="outlined" color="white" @click="goToGame" style="margin: 10px">
    Create new Game!
  </v-btn>
</template>

<style>
body {
  text-align: center;
}
canvas {
  display: block;
  margin: 0px auto;
  background: black;
}
</style>
