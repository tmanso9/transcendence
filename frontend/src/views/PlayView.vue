<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import {Socket, io} from "socket.io-client";
import {game} from "@/game/game";

const canvas = ref(null)
const s = new io("http://localhost:3000/");
onMounted(async () => {
  await  nextTick()
  s.on("connect", () => {
    console.log("connected", s);
  });
  s.emit('reset', 'reset')
  game(canvas.value as any, s);
})

function play() {
  s.emit('play', 'play')
}
function pause() {
  s.emit('pause', 'play')
}

</script>

<template>
  <canvas width="1000" height="700" id="game-canvas" ref="canvas"></canvas>
    <h4>Move left paddle up and down with the arrow keys</h4>
  <button @click="play">Play</button>
  <button @click="pause">Pause</button>
</template>

<style>
body{
  text-align: center;
}
canvas{
  display: block;
  margin: 0px auto;
  background: black;
}
</style>
