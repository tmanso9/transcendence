import { defineStore } from "pinia";
import { ref } from "vue";


export const gameStore = defineStore("game", () => {
  const isSpectator = ref(false);
  return {
    isSpectator,
  }
});
