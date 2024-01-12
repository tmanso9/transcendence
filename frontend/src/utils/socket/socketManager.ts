import { io } from "socket.io-client";
import {gameStore} from "@/store/game";

let s = null;
const game = gameStore();


export function connectSocket() {
  if (!s) {
    s = io("http://localhost:3000/");
    s.on("connect", () => {
      s.emit("reset", "reset");
    });
    s.on("spectator", (isSpectator) => {
      game.isSpectator = isSpectator;
    });
  }
  return s;
}

export function disconnectSocket() {
  if (s) {
    s.disconnect();
    console.log("disconnected");
    s = null;
  }
}

export function getSocket() {
  return s;
}
