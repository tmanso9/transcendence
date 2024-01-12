<script setup lang="ts">
import {ref, onMounted, nextTick, onUnmounted, watch} from "vue";
import { Socket} from "socket.io-client";
import { game } from "@/game/game";
import {disconnectSocket, getSocket} from "@/utils/socket/socketManager";
import router from "@/router";
import { gameStore } from "@/store/game";
import {useDisplay} from "vuetify";

const {height, width} = useDisplay();
const useGameStore = gameStore();

const canvas = ref(null);
let s: Socket = null as any;

onMounted(async () => {
  await nextTick();
  s = getSocket();

  if (s) {
    game(canvas.value as any, s);
  }
  else {
    await router.push("/play");
  }
  useGameStore.canvasWidth = width.value * 0.45;
  useGameStore.canvasHeight = width.value * 0.45 * 0.7;
});

watch(width, () => {
  useGameStore.canvasWidth = width.value * 0.45;
  useGameStore.canvasHeight = width.value * 0.45 * 0.7;
});


onUnmounted(() => {
  disconnectSocket();
});

function play() {
  s.emit("play", "play");
}
function pause() {
  s.emit("pause", "play");
}

function reset() {
  s.emit("reset", "reset");
}

function test() {
  s.emit("message", "reset");
}
</script>

<template>
  <div class="score-display">
    <h2>Score</h2>
    <p>{{ gameStore().score.get("paddle1")}} : {{ gameStore().score.get("paddle2") }}</p>
  </div>
  <canvas :width="1000" :height="700" id="game-canvas" ref="canvas"></canvas>
  <h4>Move left paddle up and down with the arrow keys</h4>
  <div v-if="!gameStore().isSpectator">
    <v-btn variant="outlined" color="white" @click="play" style="margin: 10px"
    >Play</v-btn
    >
    <v-btn variant="outlined" color="white" @click="pause" style="margin: 10px"
    >Pause</v-btn
    >
    <v-btn variant="outlined" color="white" @click="reset" style="margin: 10px"
    >Reset</v-btn
    >
  </div>
  <div v-else>
    <h1>Spectator Mode</h1>
  </div>

</template>


<style>
body {
  text-align: center;
}
canvas {
  display: block;
  margin: 0 auto;
  background: black;
}

.score-display {
  text-align: center;
}

.score-display h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.score-display p {
  font-size: 1.5em;
}
</style>
