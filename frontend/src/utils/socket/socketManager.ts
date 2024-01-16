// import { io } from "socket.io-client";
// import {gameStore} from "@/store/game";
//
//
//
// let s = null;
//
//
// let i = 0;
// export const connectSocket = (userId: string, username: string, token: string) => {
//   const game = gameStore();
//   if (!s && userId.length > 0) {
//     console.log(localStorage.getItem("debug"));
//     const  query = { userId: userId, userName: username, token: token}
//     console.log("connecting: ", query);
//     s = io("http://localhost:3000/play", { query: query });
//     console.log("connected: ", s);
//     s.on("connect", () => {
//       // s.emit("reset", "reset");
//     });
//     s.on("spectator", (isSpectator) => {
//       game.isSpectator = isSpectator;
//     });
//   }
//   return s;
// }
//
// export function disconnectSocket() {
//   if (s) {
//     s.disconnect();
//     console.log("disconnected");
//     s = null;
//   }
// }
//
// export function getSocket() {
//   return s;
// }
