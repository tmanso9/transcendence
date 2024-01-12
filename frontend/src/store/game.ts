import { defineStore } from "pinia";
import {Ref, ref} from "vue";


export const gameStore = defineStore("game", () => {
  const isSpectator = ref(false);
  const score:Ref<Map<string, number>> = ref(new Map());
  score.value.set('paddle1', 0);
  score.value.set('paddle2', 0);
  const canvasHeight = ref(700);
  const canvasWidth = ref(1000);
  function setWidth(width: number) {
    canvasWidth.value = width;
  }
  function setHeight(height: number) {
    canvasHeight.value = height;
  }
  return {
    isSpectator,
    score,
    canvasHeight,
    canvasWidth,
    setWidth,
    setHeight
  }
});
