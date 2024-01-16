<script setup lang="ts">
import {ref, onMounted, nextTick, onUnmounted, watch, inject} from "vue";
import { Socket} from "socket.io-client";
import { game } from "@/game/game";
import router from "@/router";
import { useGameStore } from "@/store/game";
import {useDisplay} from "vuetify";

const {mdAndDown} = useDisplay();

const canvasRef = ref(null);


const width = 1000;
const height = 700;
const gameStore = useGameStore();


onMounted(async () => {
  await nextTick();

  if (gameStore.getSocket()) {
    game(canvasRef.value as any, gameStore.getSocket(), width, height);
    gameStore.getSocket().on("kick", args => {
      router.push("/play");
    });
  }
  else {
    await router.push("/play");
  }
});

onUnmounted(() => {
  gameStore.score.set("paddle1", 0);
  gameStore.score.set("paddle2", 0);
  gameStore.disconnectSocket();
});

function play() {
  gameStore.getSocket().emit("play", "play");
}
function pause() {
  gameStore.getSocket().emit("pause", "play");
}

function reset() {
  gameStore.getSocket().emit("reset", "reset");
}
</script>

<template>
  <div class="div-score mx-auto">
    <div>
      Player 1
    </div>
    <div class="score-display">
      <h2>Score</h2>
      <p>{{ useGameStore().score.get("paddle1")}} : {{ useGameStore().score.get("paddle2") }}</p>
    </div>
    <div>
      Player 2
    </div>
  </div>
  <canvas width="1000" height="700" id="game-canvas" ref="canvasRef"></canvas>
  <h4>Move left paddle up and down with the arrow keys</h4>
  <div v-if="!useGameStore().isSpectator">
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

.div-score {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 1000px;
}
</style>

