import { io } from "socket.io-client";
import {gameStore} from "@/store/game";

let s = null;
const game = gameStore();


export function connectSocket(userId: string, username: string) {
  console.log("connecting: ", userId, username);
  if (!s && userId.length > 0) {
    s = io("http://localhost:3000/play", { query: { userId: userId, userName: username } });
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
