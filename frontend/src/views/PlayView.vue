<script setup lang="ts">
import {ref, onMounted, nextTick, Ref} from "vue";
import router from "@/router";
import {useDisplay} from "vuetify";
import {useUserStore} from "@/stores/user";
import {inject} from "vue";
import {VueCookies} from "vue-cookies";
import {useGameStore} from "@/store/game";

const width = 1000;
const height = 700;
const cookies = inject<VueCookies>("$cookies");
const user = useUserStore();
const gameStore = useGameStore();
const roomsList: Ref<string[]> = ref([]);

router.beforeEach((to, from, next) => {
  if (to.path !== "/game") {
    gameStore.disconnectSocket();
  }
  next();
});

function goToGame(alertId?: string) {
  gameStore.getSocket().emit("createRoom", {room: "room" +roomsList.value.length.toString(), width: width, height: height});
  router.push("/game");
}

onMounted(async () => {
  await nextTick();
  gameStore.disconnectSocket();
  console.log("onmounted: ",user.id, user.username);
  gameStore.connectSocket(cookies?.get("access_token"));
  if (gameStore.getSocket() != null) {
    gameStore.getSocket().on("availableRooms", (rooms: string[]) => {
      roomsList.value = rooms;
    });
  }
});

function joinRoom(room: string) {
  gameStore.getSocket().emit("joinRoom", room);
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
