<script setup lang="ts">
import {ref, onMounted, nextTick, onUnmounted, watch, inject, computed} from "vue";
import { Socket} from "socket.io-client";
import { game } from "@/game/game";
import router from "@/router";
import { useGameStore } from "@/store/game";
import { apiURI } from "@/utils";

const canvasRef = ref(null);

const width = 850;
const height = 850*.7;
const gameStore = useGameStore();
const img = ref(new Image());
onMounted(async () => {
  await nextTick();

  if (gameStore.getSocket()) {

    img.value.src = "/black.png";
    game(canvasRef.value as any, gameStore.getSocket(), width, height, source.value);
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

function changeStyle() {
  img.value.src = img.value.src == `${apiURI.replace("3000", "3001")}/afonsinho.jpeg` ? `${apiURI.replace("3000", "3001")}/black.png` : `${apiURI.replace("3000", "3001")}/afonsinho.jpeg`;
}

const source = computed(() => {
  return img.value;
});
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
      {{gameStore.playersList[0] || ''}}
    </div>
    <div class="score-display">
      <h2>Score</h2>
      <p>{{ useGameStore().score.get("paddle1")}} : {{ useGameStore().score.get("paddle2") }}</p>
    </div>
    <div>
      {{gameStore.playersList[1] || ''}}
    </div>
  </div>
  <canvas :width="width" :height="height" id="game-canvas" ref="canvasRef"></canvas>
  <h4>Move your paddle up and down with W and S</h4>
  <div v-if="!useGameStore().isSpectator">
    <v-btn variant="outlined" color="white" @click="changeStyle" style="margin: 10px"
    >Change Style</v-btn
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
  width: 850px;
}
</style>

