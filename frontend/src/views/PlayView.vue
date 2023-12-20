<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import { Socket, io } from "socket.io-client";
import { game } from "@/game/game";

const canvas = ref(null);
const s = new io("http://localhost:3000/");

onMounted(async () => {
  await nextTick();
  s.on("connect", () => {
    s.emit("reset", "reset");
  });
  game(canvas.value as any, s);
});

onUnmounted(() => {
  s.disconnect();
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
  <canvas width="1000" height="700" id="game-canvas" ref="canvas"></canvas>
  <h4>Move left paddle up and down with the arrow keys</h4>
  <div>
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
