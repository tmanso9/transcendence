<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import {Socket, io} from "socket.io-client";
import {game} from "@/game/game";

const canvas = ref(null)
const s = new io("http://localhost:3000/");
onMounted(async () => {
  await  nextTick()
  s.on("connect", () => {
    console.log("connected", s.id);
  });
  game(canvas.value as any, s);
})

async function test() {
  await fetch('http://localhost:3000/')
    .then(response => response.text())
    .then(data => console.log(data))
    .catch((error) => {
      console.error('Error:', error);
    });
}

</script>

<template>
  <canvas width="1000" height="700" id="game-canvas" ref="canvas"></canvas>
    <h4>Move left paddle up and down with the arrow keys</h4>
  <button class="chat" @click="test">oiiiiiiiiiiii</button>
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