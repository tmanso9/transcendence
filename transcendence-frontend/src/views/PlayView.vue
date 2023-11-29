<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import {game} from "@/game/game";

const canvas = ref(null)
onMounted(async () => {
  // drawBall();
  await  nextTick()
  game(canvas.value as any);
})

</script>

<template>
  <canvas width="1000" height="700" id="game-canvas" ref="canvas"></canvas>
    <h4>Move left paddle up and down with the arrow keys</h4>
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
